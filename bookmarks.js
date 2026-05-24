// 书签操作模块
const BOOKMARKS_BAR_ID = '1';
const OTHER_BOOKMARKS_ID = '2';

async function getAllBookmarks() {
  return chrome.bookmarks.getTree();
}

function flattenBookmarks(tree) {
  const bookmarks = [];
  const folders = [];

  function traverse(nodes, parentPath = '') {
    for (const node of nodes) {
      const currentPath = parentPath ? `${parentPath}/${node.title}` : node.title;

      if (node.children) {
        if (node.id !== '0') {
          folders.push({
            id: node.id,
            title: node.title,
            path: currentPath
          });
        }
        traverse(node.children, currentPath);
      }

      if (node.url) {
        bookmarks.push({
          id: node.id,
          title: node.title,
          url: node.url,
          folderId: node.parentId,
          folderPath: parentPath,
          dateAdded: node.dateAdded
        });
      }
    }
  }

  traverse(tree);
  return { bookmarks, folders };
}

async function getOrCreateFolder(parentId, folderName) {
  const children = await chrome.bookmarks.getChildren(parentId);
  const existing = children.find(c => c.title === folderName && !c.url);
  if (existing) return existing;

  return chrome.bookmarks.create({
    parentId,
    title: folderName
  });
}

// 查找父目录下是否已存在同名分类文件夹，返回文件夹节点或 null
async function findFolderByName(parentId, name) {
  const children = await chrome.bookmarks.getChildren(parentId);
  const found = children.find(c => c.title === name && !c.url);
  return found || null;
}

async function applyClassification(results, parentFolderId = OTHER_BOOKMARKS_ID) {
  const grouped = {};
  for (const r of results) {
    if (!grouped[r.category]) {
      grouped[r.category] = [];
    }
    grouped[r.category].push(r);
  }

  const stats = { moved: 0, total: results.length, categories: [] };

  for (const [category, bookmarks] of Object.entries(grouped)) {
    const folder = await getOrCreateFolder(parentFolderId, category);
    stats.categories.push({ category, count: bookmarks.length });

    for (const bm of bookmarks) {
      try {
        await chrome.bookmarks.move(bm.id, { parentId: folder.id });
        stats.moved++;
      } catch (e) {
        console.error(`移动书签失败: ${bm.title}`, e);
      }
    }
  }

  return stats;
}

async function undoClassification(snapshot) {
  let restored = 0;
  for (const item of snapshot) {
    try {
      await chrome.bookmarks.move(item.id, { parentId: item.originalParentId });
      restored++;
    } catch (_directMoveFailed) {
      const recovered = await tryRecoverByPath(item);
      if (recovered) { restored++; continue; }
      const fallbackOk = await tryFallbackToOtherBookmarks(item);
      if (fallbackOk) restored++;
    }
  }
  return restored;
}

async function tryRecoverByPath(item) {
  if (!item.originalFolderPath) return false;
  try {
    const parentId = await ensureFolderPath(item.originalFolderPath);
    await chrome.bookmarks.move(item.id, { parentId });
    return true;
  } catch (e) {
    console.error(`通过路径还原书签失败: ${item.title}`, e);
    return false;
  }
}

async function tryFallbackToOtherBookmarks(item) {
  try {
    await chrome.bookmarks.move(item.id, { parentId: OTHER_BOOKMARKS_ID });
    console.warn(`书签还原兜底: ${item.title} → 其他书签`);
    return true;
  } catch (e) {
    console.error(`还原书签失败: ${item.title}`, e);
    return false;
  }
}

async function ensureFolderPath(folderPath) {
  if (!folderPath) throw new Error('folderPath is empty');
  const parts = folderPath.split('/').filter(Boolean);
  if (parts.length === 0) throw new Error('folderPath has no components');

  const parentId = await resolveRootParentId(parts[0]);
  return await walkAndEnsureFolders(parentId, parts);
}

async function resolveRootParentId(firstComponent) {
  const rootIds = [BOOKMARKS_BAR_ID, OTHER_BOOKMARKS_ID];
  for (const rootId of rootIds) {
    try {
      const children = await chrome.bookmarks.getChildren(rootId);
      if (children.some(c => c.title === firstComponent && !c.url)) return rootId;
    } catch (_) {}
  }
  return OTHER_BOOKMARKS_ID;
}

async function walkAndEnsureFolders(startParentId, pathParts) {
  let currentParentId = startParentId;
  for (const part of pathParts) {
    try {
      const children = await chrome.bookmarks.getChildren(currentParentId);
      const existing = children.find(c => c.title === part && !c.url);
      currentParentId = existing ? existing.id : (await chrome.bookmarks.create({ parentId: currentParentId, title: part })).id;
    } catch (e) {
      throw new Error(`无法创建目录 "${part}": ${e.message}`);
    }
  }
  return currentParentId;
}

// 清理所有空目录（底部向上遍历，避免根目录被删）
async function cleanupEmptyFolders(excludeIds = ['0', '1', '2', '3']) {
  const deleted = [];
  const tree = await chrome.bookmarks.getTree();

  async function walkNodes(nodes) {
    for (const node of nodes) {
      if (!node.children) continue;
      // bottom-up: 先处理子节点
      await walkNodes(node.children);
      if (excludeIds.includes(node.id)) continue;
      // 重新获取最新子节点（上一轮可能已删掉部分）
      const children = await chrome.bookmarks.getChildren(node.id);
      if (children.length === 0) {
        try {
          await chrome.bookmarks.remove(node.id);
          deleted.push({ id: node.id, parentId: node.parentId, title: node.title });
        } catch (e) {
          console.error(`删除空目录失败: ${node.title}`, e);
        }
      }
    }
  }

  await walkNodes(tree);
  return deleted;
}

// 恢复已删除的目录，返回 oldId→newId 映射
async function restoreFolders(deletedFolders) {
  const idMap = {};
  // reversed: 因为删除是 bottom-up，反转后为 top-down，保证父目录先创建
  for (let i = deletedFolders.length - 1; i >= 0; i--) {
    const f = deletedFolders[i];
    try {
      const created = await chrome.bookmarks.create({
        parentId: idMap[f.parentId] || f.parentId,
        title: f.title
      });
      idMap[f.id] = created.id;
    } catch (e) {
      console.error(`恢复目录失败: ${f.title}`, e);
    }
  }
  return idMap;
}

// 备份
const BACKUP_KEY = 'abookmark_bookmark_backup';

async function saveBackup() {
  const tree = await getAllBookmarks();
  const backup = {
    timestamp: Date.now(),
    tree
  };
  await chrome.storage.local.set({ [BACKUP_KEY]: backup });
  return backup;
}

async function getBackup() {
  const stored = await chrome.storage.local.get(BACKUP_KEY);
  return stored[BACKUP_KEY] || null;
}

async function clearBackup() {
  await chrome.storage.local.remove(BACKUP_KEY);
}

export { getAllBookmarks, flattenBookmarks, getOrCreateFolder, findFolderByName, applyClassification, undoClassification, ensureFolderPath, BOOKMARKS_BAR_ID, OTHER_BOOKMARKS_ID, cleanupEmptyFolders, restoreFolders, saveBackup, getBackup, clearBackup };
