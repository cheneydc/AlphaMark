// bookmarks.test.js — 书签模块纯函数单元测试
// 使用方式: node --experimental-vm-modules tests/bookmarks.test.js

import { flattenBookmarks } from '../bookmarks.js';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    passed++;
    process.stdout.write('  ✅ ');
  } else {
    failed++;
    process.stdout.write('  ❌ ');
  }
  console.log(msg);
}

function assertEqual(actual, expected, msg) {
  const ok = actual === expected;
  if (ok) {
    passed++;
    process.stdout.write('  ✅ ');
  } else {
    failed++;
    process.stdout.write(`  ❌ (expected: ${JSON.stringify(expected)}, got: ${JSON.stringify(actual)}) `);
  }
  console.log(msg);
}

console.log('\n📁 ===== 书签模块测试 =====\n');

// ===== flattenBookmarks =====
console.log('── flattenBookmarks ──');

// 空树
const empty = flattenBookmarks([]);
assertEqual(empty.bookmarks.length, 0, '空树 → 0 个书签');
assertEqual(empty.folders.length, 0, '空树 → 0 个文件夹');

// 单层书签（无文件夹）
const flatOnly = flattenBookmarks([
  {
    id: '1', title: 'Bookmarks Bar',
    children: [
      { id: '11', title: 'GitHub', url: 'https://github.com', parentId: '1', dateAdded: 1000 },
      { id: '12', title: 'StackOverflow', url: 'https://stackoverflow.com', parentId: '1', dateAdded: 1001 }
    ]
  }
]);
assertEqual(flatOnly.bookmarks.length, 2, '单层 → 2 个书签');
assertEqual(flatOnly.bookmarks[0].title, 'GitHub', '第一个书签标题正确');
assertEqual(flatOnly.bookmarks[0].folderPath, 'Bookmarks Bar', 'folderPath 为父节点标题');
assertEqual(flatOnly.bookmarks[0].folderId, '1', 'folderId 为父节点 ID');
assertEqual(flatOnly.folders.length, 1, '1 个文件夹（根节点）');
assertEqual(flatOnly.folders[0].title, 'Bookmarks Bar', '文件夹标题正确');

// 嵌套文件夹
const nested = flattenBookmarks([
  {
    id: '1', title: 'Bookmarks Bar',
    children: [
      {
        id: '2', title: 'Tech',
        children: [
          { id: '21', title: 'GitHub', url: 'https://github.com', parentId: '2', dateAdded: 1000 },
          { id: '22', title: 'Docker', url: 'https://docker.com', parentId: '2', dateAdded: 1001 }
        ]
      },
      {
        id: '3', title: 'News',
        children: [
          { id: '31', title: 'TechCrunch', url: 'https://techcrunch.com', parentId: '3', dateAdded: 1002 }
        ]
      }
    ]
  }
]);
assertEqual(nested.bookmarks.length, 3, '嵌套 → 3 个书签');
assertEqual(nested.folders.length, 3, '嵌套 → 3 个文件夹（含根）');

// 检查 folderPath
const gitHubBm = nested.bookmarks.find(b => b.title === 'GitHub');
assertEqual(gitHubBm.folderPath, 'Bookmarks Bar/Tech', '嵌套书签的 folderPath 为层级路径');
assertEqual(gitHubBm.folderId, '2', '嵌套书签的 folderId');

const tcBm = nested.bookmarks.find(b => b.title === 'TechCrunch');
assertEqual(tcBm.folderPath, 'Bookmarks Bar/News', '另一个嵌套路径正确');

// 检查文件夹列表
const techFolder = nested.folders.find(f => f.title === 'Tech');
assertEqual(techFolder.path, 'Bookmarks Bar/Tech', '文件夹 path 为层级路径');

const newsFolder = nested.folders.find(f => f.title === 'News');
assertEqual(newsFolder.path, 'Bookmarks Bar/News', '新闻文件夹路径正确');

// 深层嵌套（3 层）
const deepNested = flattenBookmarks([
  {
    id: '1', title: 'Root',
    children: [
      {
        id: '2', title: 'Level1',
        children: [
          {
            id: '3', title: 'Level2',
            children: [
              { id: '4', title: 'DeepBM', url: 'https://deep.example.com', parentId: '3', dateAdded: 999 }
            ]
          }
        ]
      }
    ]
  }
]);
assertEqual(deepNested.bookmarks.length, 1, '深层嵌套 → 1 个书签');
assertEqual(deepNested.bookmarks[0].folderPath, 'Root/Level1/Level2', '3 层 folderPath');
assertEqual(deepNested.bookmarks[0].url, 'https://deep.example.com', 'URL 正确');

// 混合：书签和文件夹同层
const mixed = flattenBookmarks([
  {
    id: '1', title: 'Root',
    children: [
      { id: '11', title: 'Google', url: 'https://google.com', parentId: '1', dateAdded: 10 },
      {
        id: '12', title: 'SubFolder',
        children: [
          { id: '121', title: 'Internal', url: 'https://internal.com', parentId: '12', dateAdded: 20 }
        ]
      }
    ]
  }
]);
assertEqual(mixed.bookmarks.length, 2, '混合结构 → 2 个书签');
assertEqual(mixed.folders.length, 2, '混合结构 → 2 个文件夹（含根）');

// 根节点 id=0 不应计入 folders
const rootSkipped = flattenBookmarks([
  {
    id: '0', title: 'Root',
    children: [
      { id: '1', title: 'Bookmark', url: 'https://x.com', parentId: '0', dateAdded: 1 }
    ]
  }
]);
assertEqual(rootSkipped.folders.length, 0, 'id=0 的根节点不计入 folders');

console.log(`\n📊 结果: ${passed} 通过, ${failed} 失败 (共 ${passed + failed} 项)\n`);

if (failed > 0) {
  process.exit(1);
}
