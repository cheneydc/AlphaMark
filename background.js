import { classifyBookmarkFast, extractPageText, DEFAULT_CONFIG } from './classifier.js';
import { getAllBookmarks, flattenBookmarks, getOrCreateFolder, findFolderByName, applyClassification, undoClassification, cleanupEmptyFolders, restoreFolders, saveBackup, getBackup, clearBackup, BOOKMARKS_BAR_ID, OTHER_BOOKMARKS_ID } from './bookmarks.js';
import { classifyBatchWithLLM, singleClassifyWithLLM, validateLLMConfig, DEFAULT_LLM_CONFIG, getDefaultLLMConfig, saveLLMNewCategories, getDynamicCategories, getAllCategoryNames } from './llm.js';
import { getHistorySummary, getTopSitesByHistory, mergeHistoryWeight, getHistoryConfig, DEFAULT_HISTORY_CONFIG } from './history.js';

const FIRST_SCAN_DONE_KEY = 'abookmark_first_scan_done';
const AI_TOGGLE_KEY = 'abookmark_ai_toggle';
const ANALYSIS_RESULT_KEY = 'abookmark_latest_analysis';
const CONSENT_KEY = 'abookmark_user_consent';
const PRIVACY_CONFIG_KEY = 'abookmark_privacy_config';
const DEFAULT_PRIVACY_CONFIG = { allowHistory: true };

let operationSnapshot = null;
let deletedFoldersSnapshot = null;
let cachedAnalysisResults = null;
let currentProgress = { total: 0, processed: 0, status: 'idle' };
let currentAnalysisController = null;

async function getFullConfig() {
  try {
    const stored = await chrome.storage.sync.get(['abookmark_config', 'abookmark_llm_config', 'abookmark_history_config']);
    const baseLLM = getDefaultLLMConfig();
    return {
      feature: { ...DEFAULT_CONFIG, ...(stored.abookmark_config || {}) },
      llm: { ...baseLLM, ...(stored.abookmark_llm_config || {}) },
      history: { ...DEFAULT_HISTORY_CONFIG, ...(stored.abookmark_history_config || {}) }
    };
  } catch (e) {
    console.warn('读取存储配置失败，使用默认配置:', e);
    return {
      feature: { ...DEFAULT_CONFIG },
      llm: getDefaultLLMConfig(),
      history: { ...DEFAULT_HISTORY_CONFIG }
    };
  }
}

async function classifyWithLLM(bookmarks, config, signal, onProgress) {
  const total = bookmarks.length;
  if (total === 0) return [];
  const allNewCategories = new Set();
  const results = [];
  const batchSize = config.llm.batchSize || 30;
  const maxConcurrent = 3; // 并行上限，避免 API 限流
  // 将书签分成多个批次
  const batches = [];
  for (let i = 0; i < bookmarks.length; i += batchSize) {
    batches.push(bookmarks.slice(i, Math.min(i + batchSize, bookmarks.length)));
  }

  // 带并发控制的并行执行
  let idx = 0;
  let processedCount = 0;
  async function nextBatch() {
    while (idx < batches.length) {
      const batchIdx = idx++;
      const batch = batches[batchIdx];
      try {
        const batchResult = await classifyBatchWithLLM(batch, config.llm, signal);
        if (batchResult) {
          for (let j = 0; j < batchResult.results.length; j++) {
            results[batchIdx * batchSize + j] = { ...batch[j], llmResult: batchResult.results[j] };
          }
          processedCount += batchResult.results.length;
          if (batchResult.newCategories && batchResult.newCategories.length > 0) {
            batchResult.newCategories.forEach(c => allNewCategories.add(c));
          }
        } else {
          processedCount += batch.length;
          for (let j = 0; j < batch.length; j++) {
            results[batchIdx * batchSize + j] = { ...batch[j], llmResult: null };
          }
        }
      } catch (e) {
        if (e?.name === 'AbortError' || (signal && signal.aborted)) {
          // 用户取消或 Service Worker 终止，静默处理
        } else {
          console.error('LLM 批量分类失败:', e?.message || e);
        }
        processedCount += batch.length;
        for (let j = 0; j < batch.length; j++) {
          results[batchIdx * batchSize + j] = { ...batch[j], llmResult: null };
        }
      }
      if (onProgress) onProgress({ status: 'llm_classifying', total, processed: processedCount });
    }
  }

  await Promise.all(Array.from({ length: maxConcurrent }, () => nextBatch()));

  // 按原始顺序整理结果
  const orderedResults = [];
  for (let i = 0; i < bookmarks.length; i++) {
    if (results[i]) orderedResults.push(results[i]);
  }

  if (allNewCategories.size > 0) {
    await saveLLMNewCategories(Array.from(allNewCategories));
  }

  return orderedResults;
}

function mergeClassification(bm, keywordResult, llmResult, historyWeight) {
  const source = llmResult ? 'llm' : 'keyword';

  if (llmResult) {
    return {
      id: bm.id,
      title: bm.title,
      url: bm.url,
      folderId: bm.folderId,
      folderPath: bm.folderPath,
      category: llmResult.category,
      confidence: historyWeight > 5 ? 'high' : llmResult.confidence,
      score: historyWeight > 5 ? 90 : 70,
      scores: { [llmResult.category]: historyWeight > 5 ? 90 : 70 },
      source: 'llm',
      historyWeight,
      visitCount: bm.visitCount || 0
    };
  }

  return {
    id: bm.id,
    title: bm.title,
    url: bm.url,
    folderId: bm.folderId,
    folderPath: bm.folderPath,
    category: keywordResult.category,
    confidence: historyWeight > 5 ? 'high' : keywordResult.confidence,
    score: keywordResult.score + Math.floor(historyWeight * 2),
    scores: keywordResult.scores || {},
    source: 'keyword',
    historyWeight,
    visitCount: bm.visitCount || 0
  };
}

async function analyzeBookmarks(progressCallback) {
  cachedAnalysisResults = null;
  currentAnalysisController = new AbortController();
  const signal = currentAnalysisController.signal;

  const config = await getFullConfig();

  if (signal.aborted) return { results: [], total: 0, cancelled: true };
  const historyConfig = config.history;
  const tree = await getAllBookmarks();
  const { bookmarks } = flattenBookmarks(tree);

  if (bookmarks.length === 0) {
    return { results: [], total: 0 };
  }

  const total = bookmarks.length;

  // 合并历史权重（受隐私设置控制）
  progressCallback({ status: 'collecting', total, processed: 0 });

  const privacyStored = await chrome.storage.local.get(PRIVACY_CONFIG_KEY);
  const privacy = { ...DEFAULT_PRIVACY_CONFIG, ...(privacyStored[PRIVACY_CONFIG_KEY] || {}) };

  let weightedBookmarks = bookmarks;
  if (privacy.allowHistory && historyConfig.includeHistoryInAnalysis) {
    weightedBookmarks = await mergeHistoryWeight(bookmarks, historyConfig.historyMonths);
  }

  // 关键词初步分类
  progressCallback({ status: 'keyword_classify', total, processed: 0 });
  const keywordClassified = weightedBookmarks.map((bm, i) => {
    const result = classifyBookmarkFast(bm.url, bm.title);
    if (i % 50 === 0 || i === weightedBookmarks.length - 1) {
      progressCallback({ status: 'keyword_classify', total, processed: i + 1 });
    }
    return { ...bm, keywordResult: result };
  });

  let finalResults;

  // 如果启用 LLM 且弹出窗口 AI 开关已打开
  const aiToggle = (await chrome.storage.local.get(AI_TOGGLE_KEY))[AI_TOGGLE_KEY] || false;
  if (!signal.aborted && config.llm.enabled && config.llm.apiKey && aiToggle) {
    progressCallback({ status: 'llm_classifying', total, processed: 0 });
    try {
      const llmClassified = await classifyWithLLM(keywordClassified, config, signal, progressCallback);
      finalResults = llmClassified.map(bm => {
        return mergeClassification(bm, bm.keywordResult, bm.llmResult, bm.historyWeight || 0);
      });
    } catch (e) {
      console.error('LLM 分类失败，使用关键词分类:', e);
      finalResults = keywordClassified.map(bm => {
        return mergeClassification(bm, bm.keywordResult, null, bm.historyWeight || 0);
      });
    }
  } else {
    finalResults = keywordClassified.map(bm => {
      return mergeClassification(bm, bm.keywordResult, null, bm.historyWeight || 0);
    });
  }

  // 限制总分类数不超过 maxCategories
  const maxCats = Math.max(1, config.llm.maxCategories || 10);
  const catCount = {};
  for (const r of finalResults) catCount[r.category] = (catCount[r.category] || 0) + 1;
  const sortedCats = Object.entries(catCount).sort((a, b) => b[1] - a[1]);
  if (sortedCats.length > maxCats) {
    const keepCats = new Set(sortedCats.slice(0, maxCats).map(([c]) => c));
    const biggestKept = sortedCats[0][0];
    for (const r of finalResults) {
      if (!keepCats.has(r.category)) r.category = biggestKept;
    }
  }

  progressCallback({ status: 'done', total, processed: total });
  cachedAnalysisResults = { results: finalResults, total };
  currentAnalysisController = null;

  // 持久化分析结果，关闭弹窗后重开仍可查看
  try {
    await chrome.storage.local.set({
      [ANALYSIS_RESULT_KEY]: { results: finalResults, total, timestamp: Date.now(), consumed: false }
    });
  } catch (e) {
    console.warn('持久化分析结果失败:', e);
  }

  return { results: finalResults, total };
}

async function executeOrganize(parentFolderId, progressCallback) {
  if (!currentAnalysisController) currentAnalysisController = new AbortController();
  const signal = currentAnalysisController.signal;
  if (signal.aborted) return { success: false, cancelled: true, stats: { moved: 0, total: 0, categories: [] } };

  // 使用缓存的分析结果，避免重复分析
  // 优先使用内存缓存，如果不可用则从持久化存储恢复
  let cache = cachedAnalysisResults;
  if (!cache || !cache.results || cache.results.length === 0) {
    try {
      const stored = await chrome.storage.local.get(ANALYSIS_RESULT_KEY);
      if (stored[ANALYSIS_RESULT_KEY] && stored[ANALYSIS_RESULT_KEY].results) {
        cachedAnalysisResults = cache = stored[ANALYSIS_RESULT_KEY];
      }
    } catch (e) {}
  }
  if (!cache || !cache.results || cache.results.length === 0) {
    return { success: false, stats: { moved: 0, total: 0, categories: [] } };
  }
  const { results, total } = cache;

  operationSnapshot = results.map(r => ({
    id: r.id,
    title: r.title,
    url: r.url,
    originalParentId: r.folderId,
    originalFolderPath: r.folderPath,
    category: r.category
  }));

  progressCallback({ status: 'organizing', total: results.length, processed: 0 });

  // 备份原始书签
  await saveBackup();

  const parentId = parentFolderId || BOOKMARKS_BAR_ID;
  const stats = await applyClassification(results, parentId);

  // 整理完成后清理所有空目录
  deletedFoldersSnapshot = await cleanupEmptyFolders();

  progressCallback({ status: 'complete', total: stats.total, processed: stats.moved });
  currentAnalysisController = null;
  cachedAnalysisResults = null; // 已消费，释放内存
  // 已消费，清除持久化结果
  chrome.storage.local.remove(ANALYSIS_RESULT_KEY).catch(() => {});
  return { success: true, stats };
}

async function undoOrganize(progressCallback) {
  if (!operationSnapshot || operationSnapshot.length === 0) {
    return { success: false, message: '没有可撤销的操作' };
  }

  progressCallback({ status: 'undoing', total: operationSnapshot.length, processed: 0 });

  // 先恢复被删除的空目录，并将原 parentId 映射到新 ID
  if (deletedFoldersSnapshot && deletedFoldersSnapshot.length > 0) {
    const idMap = await restoreFolders(deletedFoldersSnapshot);
    operationSnapshot = operationSnapshot.map(item => ({
      ...item,
      originalParentId: idMap[item.originalParentId] || item.originalParentId
    }));
    deletedFoldersSnapshot = null;
  }

  const count = await undoClassification(operationSnapshot);

  progressCallback({ status: 'complete', total: operationSnapshot.length, processed: count });

  cachedAnalysisResults = null;
  const snapshot = operationSnapshot;
  operationSnapshot = null;
  return { success: true, restored: count, snapshot };
}

function getProgress() {
  return currentProgress;
}

function getSnapshot() {
  return operationSnapshot;
}

// 全量 AI 扫描所有书签（首次安装或手动触发）
async function scanAllBookmarks(progressCallback) {
  const tree = await getAllBookmarks();
  const { bookmarks } = flattenBookmarks(tree);

  if (bookmarks.length === 0) {
    return { success: false, stats: { moved: 0, total: 0, categories: [] } };
  }

  // 备份原始书签
  await saveBackup();

  // 运行分析（使用 LLM 如果已启用）
  const analysis = await analyzeBookmarks(progressCallback);
  if (!analysis || !analysis.results || analysis.results.length === 0) {
    return { success: false, stats: { moved: 0, total: 0, categories: [] } };
  }
  cachedAnalysisResults = analysis;

  // 执行整理
  const result = await executeOrganize(BOOKMARKS_BAR_ID, progressCallback);
  return result;
}

// 首次安装：不再自动扫描，等待用户同意数据使用授权后手动操作
// 升级/重载：用户配置自动保留（chrome.storage 持久化），无需迁移逻辑
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // 不再自动扫描，用户需先同意 consent 后再使用
  }
    if (details.reason === 'update') {
      // 验证配置完整性：读取并恢复，如有损坏自动重置为默认值
      const config = await getFullConfig();
      const { abookmark_config, abookmark_llm_config } = await chrome.storage.sync.get(['abookmark_config', 'abookmark_llm_config']);
      if (!abookmark_config || !abookmark_llm_config) {
        console.warn('配置读取异常，将重新应用默认值（已有值不受影响）');
      }
      // 清除因 Service Worker 重启导致的过期内存状态
      cachedAnalysisResults = null;
      currentAnalysisController = null;
      updateSuggestionBadge();
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'analyze':
      (async () => {
        const consentStored = await chrome.storage.local.get(CONSENT_KEY);
        if (!consentStored[CONSENT_KEY]) {
          sendResponse({ results: [], total: 0, cancelled: true, error: 'consent_required' });
          return;
        }
        analyzeBookmarks((progress) => {
          currentProgress = progress;
          chrome.runtime.sendMessage({ action: 'progress', progress }).catch(() => {});
        }).then(result => {
          currentProgress = { ...currentProgress, status: 'idle' };
          sendResponse(result);
        })
          .catch(e => {
            console.error('分析过程异常:', e?.message || e);
            sendResponse({ results: [], total: 0, cancelled: true, error: true });
          });
      })();
      return true;

    case 'organize':
      executeOrganize(message.parentFolderId, (progress) => {
        chrome.runtime.sendMessage({ action: 'progress', progress }).catch(() => {});
      }).then(result => sendResponse(result))
        .catch(e => {
          console.error('整理过程异常:', e?.message || e);
          sendResponse({ success: false, cancelled: true, error: true, stats: { moved: 0, total: 0, categories: [] } });
        });
      return true;

    case 'undo':
      undoOrganize((progress) => {
        chrome.runtime.sendMessage({ action: 'progress', progress }).catch(() => {});
      }).then(result => sendResponse(result))
        .catch(e => {
          console.error('撤销过程异常:', e?.message || e);
          sendResponse({ success: false, error: true });
        });
      return true;

    case 'getHistory':
      (async () => {
        const privacyStored = await chrome.storage.local.get(PRIVACY_CONFIG_KEY);
        const privacy = { ...DEFAULT_PRIVACY_CONFIG, ...(privacyStored[PRIVACY_CONFIG_KEY] || {}) };
        if (!privacy.allowHistory) {
          sendResponse({ totalVisits: 0, uniqueDomains: 0, uniqueUrls: 0, topSites: [], periodMonths: 3 });
          return;
        }
        const hc = await getHistoryConfig();
        const summary = await getHistorySummary(hc.historyMonths);
        sendResponse(summary);
      })();
      return true;

    case 'getTopSites':
      (async () => {
        const privacyStored = await chrome.storage.local.get(PRIVACY_CONFIG_KEY);
        const privacy = { ...DEFAULT_PRIVACY_CONFIG, ...(privacyStored[PRIVACY_CONFIG_KEY] || {}) };
        if (!privacy.allowHistory) {
          sendResponse([]);
          return;
        }
        const hc = await getHistoryConfig();
        const sites = await getTopSitesByHistory(hc.historyMonths, message.limit || 20);
        sendResponse(sites);
      })();
      return true;

    case 'validateLLM':
      (async () => {
        const { abookmark_llm_config: config } = await chrome.storage.sync.get('abookmark_llm_config');
        const result = await validateLLMConfig(config || DEFAULT_LLM_CONFIG);
        sendResponse(result);
      })();
      return true;

    case 'getSnapshot':
      sendResponse({ snapshot: getSnapshot() });
      return false;

    case 'getProgress':
      sendResponse({ progress: getProgress() });
      return false;

    case 'getBackup':
      (async () => {
        const backup = await getBackup();
        sendResponse({ backup });
      })();
      return true;

    case 'restoreFromBackup':
      (async () => {
        const backup = await getBackup();
        if (!backup) { sendResponse({ success: false, message: '没有备份' }); return; }
        try {
          const json = JSON.stringify(backup.tree, null, 2);
          sendResponse({ success: true, json, timestamp: backup.timestamp });
        } catch (e) {
          sendResponse({ success: false, message: e.message });
        }
      })();
      return true;

    case 'clearBackup':
      (async () => {
        await clearBackup();
        sendResponse({ success: true });
      })();
      return true;

    case 'getConfig':
      (async () => {
        const fullConfig = await getFullConfig();
        sendResponse({ config: fullConfig.feature, llmConfig: fullConfig.llm, historyConfig: fullConfig.history });
      })();
      return true;

    case 'saveConfig':
      chrome.storage.sync.set({ abookmark_config: message.config })
        .then(() => sendResponse({ success: true }))
        .catch(() => sendResponse({ success: false }));
      return true;

    case 'saveLLMConfig':
      chrome.storage.sync.set({ abookmark_llm_config: message.config })
        .then(() => sendResponse({ success: true }))
        .catch(() => sendResponse({ success: false }));
      return true;

    case 'saveHistoryConfig':
      chrome.storage.sync.set({ abookmark_history_config: message.config })
        .then(() => sendResponse({ success: true }))
        .catch(() => sendResponse({ success: false }));
      return true;

    case 'getDynamicCategories':
      (async () => {
        const cats = await getDynamicCategories();
        sendResponse({ categories: cats });
      })();
      return true;

    case 'getPendingSuggestions':
      (async () => {
        const suggestions = await loadPendingSuggestions();
        sendResponse({ suggestions: suggestions.filter(s => s.status === 'pending') });
      })();
      return true;

    case 'confirmSuggestion':
      (async () => {
        const { suggestionId } = message;
        const suggestions = await loadPendingSuggestions();
        const idx = suggestions.findIndex(s => s.id === suggestionId);
        if (idx === -1) { sendResponse({ success: false }); return; }

        const sug = suggestions[idx];
        try {
          // 优先查找书签栏，找不到再使用其他书签
          let folder = await findFolderByName(BOOKMARKS_BAR_ID, sug.suggestedCategory);
          if (!folder) {
            folder = await findFolderByName(OTHER_BOOKMARKS_ID, sug.suggestedCategory);
          }
          if (!folder) {
            folder = await getOrCreateFolder(BOOKMARKS_BAR_ID, sug.suggestedCategory);
          }
          await chrome.bookmarks.move(sug.bookmarkId, { parentId: folder.id });
          suggestions[idx].status = 'confirmed';
          await savePendingSuggestions(suggestions);
          updateSuggestionBadge();
          sendResponse({ success: true });
        } catch (e) {
          sendResponse({ success: false, error: e.message });
        }
      })();
      return true;

    case 'rejectSuggestion':
      (async () => {
        const { suggestionId } = message;
        const suggestions = await loadPendingSuggestions();
        const idx = suggestions.findIndex(s => s.id === suggestionId);
        if (idx === -1) { sendResponse({ success: false }); return; }
        suggestions[idx].status = 'rejected';
        await savePendingSuggestions(suggestions);
        updateSuggestionBadge();
        sendResponse({ success: true });
      })();
      return true;

    case 'clearAllSuggestions':
      (async () => {
        await savePendingSuggestions([]);
        updateSuggestionBadge();
        sendResponse({ success: true });
      })();
      return true;

    case 'getAiToggle':
      (async () => {
        const stored = await chrome.storage.local.get(AI_TOGGLE_KEY);
        const fullConfig = await getFullConfig();
        const llmConfigured = fullConfig.llm.enabled && fullConfig.llm.apiKey && fullConfig.llm.customBaseUrl && (fullConfig.llm.model || fullConfig.llm.customModel);
        sendResponse({ enabled: !!stored[AI_TOGGLE_KEY], llmConfigured });
      })();
      return true;

    case 'setAiToggle':
      (async () => {
        await chrome.storage.local.set({ [AI_TOGGLE_KEY]: !!message.enabled });
        sendResponse({ success: true });
      })();
      return true;

    case 'checkAnalysisResult':
      (async () => {
        try {
          const stored = await chrome.storage.local.get(ANALYSIS_RESULT_KEY);
          const data = stored[ANALYSIS_RESULT_KEY];
          sendResponse({ found: !!data && !data.consumed, ...(data || {}) });
        } catch (e) {
          sendResponse({ found: false });
        }
      })();
      return true;

    case 'consumeAnalysisResult':
      chrome.storage.local.remove(ANALYSIS_RESULT_KEY).then(() => sendResponse({ success: true })).catch(() => sendResponse({ success: false }));
      return true;

    case 'cancelAnalysis':
      if (currentAnalysisController) {
        currentAnalysisController.abort();
        currentAnalysisController = null;
      }
      sendResponse({ success: true });
      return true;

    default:
      sendResponse({ error: 'Unknown action' });
      return false;
  }
});

// ===== 书签创建智能推荐 =====
// 收藏新书签时分析并推荐分类，保存为待确认建议，不自动移动
// 用户在弹窗中查看建议并决定：确认（移动到分类目录）或忽略

const PENDING_SUGGESTIONS_KEY = 'abookmark_pending_suggestions';
let pendingSuggestionsCache = null;

async function updateSuggestionBadge() {
  try {
    const suggestions = await loadPendingSuggestions();
    const pending = suggestions.filter(s => s.status === 'pending').length;
    if (pending > 0) {
      await chrome.action.setBadgeText({ text: String(pending) });
      await chrome.action.setBadgeBackgroundColor({ color: '#e94560' });
    } else {
      await chrome.action.setBadgeText({ text: '' });
    }
  } catch (e) {
    // badge update is best-effort
  }
}

async function loadPendingSuggestions() {
  if (pendingSuggestionsCache) return pendingSuggestionsCache;
  try {
    const stored = await chrome.storage.local.get(PENDING_SUGGESTIONS_KEY);
    pendingSuggestionsCache = stored[PENDING_SUGGESTIONS_KEY] || [];
    return pendingSuggestionsCache;
  } catch (e) {
    return [];
  }
}

async function savePendingSuggestions(suggestions) {
  pendingSuggestionsCache = suggestions;
  try {
    await chrome.storage.local.set({ [PENDING_SUGGESTIONS_KEY]: suggestions });
  } catch (e) {
    console.error('保存待确认建议失败:', e);
  }
}

async function classifyNewBookmark(id, bookmark) {
  const fullConfig = await getFullConfig();
  const llmConfig = fullConfig.llm;

  let targetCategory = null;
  let source = 'keyword';

  // 优先使用 LLM 分类
  const aiToggle = (await chrome.storage.local.get(AI_TOGGLE_KEY))[AI_TOGGLE_KEY] || false;
  if (llmConfig.enabled && llmConfig.apiKey && aiToggle) {
    try {
      const llmResult = await singleClassifyWithLLM(
        { url: bookmark.url, title: bookmark.title || '' },
        llmConfig
      );
      if (llmResult && llmResult.category) {
        targetCategory = llmResult.category;
        source = 'llm';
      }
    } catch (e) {
      console.error('LLM 分类失败，回退到关键词:', e);
    }
  }

  // 回退：关键词分类
  if (!targetCategory) {
    const kwResult = classifyBookmarkFast(bookmark.url, bookmark.title || '');
    if (kwResult && kwResult.confidence !== 'low') {
      targetCategory = kwResult.category;
    }
  }

  return targetCategory ? { category: targetCategory, source } : null;
}

async function onBookmarkCreated(id, bookmark) {
  if (!bookmark.url) return;
  const consentStored = await chrome.storage.local.get(CONSENT_KEY);
  if (!consentStored[CONSENT_KEY]) return;

  // 获取用户的当前分类文件夹名（新书签的当前位置）
  let currentFolderName = '未分类';
  try {
    const parentNode = await chrome.bookmarks.get(bookmark.parentId);
    if (parentNode && parentNode[0] && parentNode[0].title) {
      currentFolderName = parentNode[0].title;
    }
  } catch (e) {}

  const classification = await classifyNewBookmark(id, bookmark);
  if (!classification) return;

  // 如果书签当前已在该分类目录中，无需建议
  if (currentFolderName === classification.category) return;

  // 保存为待确认建议，不自动移动书签
  const suggestions = await loadPendingSuggestions();
  suggestions.push({
    id: `sug_${Date.now()}_${id}`,
    bookmarkId: id,
    bookmarkTitle: bookmark.title || bookmark.url,
    bookmarkUrl: bookmark.url,
    currentCategory: currentFolderName,
    suggestedCategory: classification.category,
    source: classification.source,
    createdAt: Date.now(),
    status: 'pending'
  });
  await savePendingSuggestions(suggestions);
  updateSuggestionBadge();
}

chrome.bookmarks.onCreated.addListener(onBookmarkCreated);
