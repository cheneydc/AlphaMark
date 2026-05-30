import { t, initLang, applyI18nToDOM } from './i18n.js';

let analysisResult = null;
let _progressPollTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initLang();
    applyI18nToDOM();
    await loadBookmarkCount();
    await loadPendingSuggestions();
    await loadAiToggle();
    bindEvents();
    bindPreviewEvents();
    checkUndoState();
    await loadHistory();
    await checkPendingAnalysis();
  } catch (e) {
    console.error('Popup 初始化失败:', e);
    bindEvents();
    bindPreviewEvents();
  }
});

async function loadBookmarkCount() {
  try {
    const tree = await chrome.bookmarks.getTree();
    let count = 0;
    function countBookmarks(nodes) {
      for (const node of nodes) {
        if (node.url) count++;
        if (node.children) countBookmarks(node.children);
      }
    }
    countBookmarks(tree);
    document.getElementById('bookmarkCount').textContent = t('bookmarkCount', { count });
  } catch (e) {
    document.getElementById('bookmarkCount').textContent = t('cannotLoad');
  }
}

async function loadPendingSuggestions() {
  const container = document.getElementById('suggestionBanner');
  const list = document.getElementById('suggestionList');
  const countEl = document.getElementById('suggestionCount');
  const summaryEl = document.getElementById('suggestionSummary');
  const actionsEl = document.getElementById('suggestionActions');
  const applyBtn = document.getElementById('applyAllSuggestionsBtn');
  const dismissBtn = document.getElementById('dismissAllSuggestionsBtn');

  let suggestions;
  try {
    const res = await chrome.runtime.sendMessage({ action: 'getPendingSuggestions' });
    suggestions = res.suggestions;
  } catch (e) {
    container.classList.add('hidden');
    return;
  }
  if (!suggestions || suggestions.length === 0) {
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');

  // Count + summary
  countEl.textContent = suggestions.length;
  const newCats = [...new Set(suggestions.map(s => s.suggestedCategory))];
  summaryEl.textContent = t('suggestionSummary', {
    count: suggestions.length,
    categories: newCats.join('、')
  });

  // Suggestion list
  list.innerHTML = suggestions.map(s => {
    const sourceLabel = s.source === 'llm' ? '🤖' : '🔍';
    return `
    <div class="suggestion-item" data-id="${escapeHtml(s.id)}">
      <span class="suggestion-item-title" title="${escapeHtml(s.bookmarkTitle)}">${escapeHtml(s.bookmarkTitle)}</span>
      <span class="suggestion-item-source" title="${s.source === 'llm' ? 'AI 分类' : '关键词分类'}">${sourceLabel}</span>
      <span class="suggestion-item-change">
        <span class="suggestion-item-from">${escapeHtml(s.currentCategory)}</span>
        <span class="suggestion-item-arrow">→</span>
        <span class="suggestion-item-to">${escapeHtml(s.suggestedCategory)}</span>
      </span>
      <button class="suggestion-item-remove" title="${t('suggestionDismissAll')}">✕</button>
    </div>
  `}).join('');

  actionsEl.classList.remove('hidden');

  // Single item remove → mark rejected
  list.querySelectorAll('.suggestion-item-remove').forEach(btn => {
    btn.addEventListener('click', async () => {
      const item = btn.closest('.suggestion-item');
      const id = item.dataset.id;
      await chrome.runtime.sendMessage({ action: 'rejectSuggestion', suggestionId: id }).catch(() => {});
      item.remove();
      updateSuggestionState();
    });
  });

  // Apply all
  applyBtn.onclick = async () => {
    applyBtn.disabled = true;
    applyBtn.textContent = '⏳...';
    for (const item of list.querySelectorAll('.suggestion-item')) {
      await chrome.runtime.sendMessage({ action: 'confirmSuggestion', suggestionId: item.dataset.id }).catch(() => {});
    }
    container.classList.add('hidden');
  };

  // Dismiss all
  dismissBtn.onclick = async () => {
    for (const item of list.querySelectorAll('.suggestion-item')) {
      await chrome.runtime.sendMessage({ action: 'rejectSuggestion', suggestionId: item.dataset.id }).catch(() => {});
    }
    await chrome.runtime.sendMessage({ action: 'clearAllSuggestions' }).catch(() => {});
    container.classList.add('hidden');
  };
}

function updateSuggestionState() {
  const container = document.getElementById('suggestionBanner');
  const list = document.getElementById('suggestionList');
  const countEl = document.getElementById('suggestionCount');
  const summaryEl = document.getElementById('suggestionSummary');
  const actionsEl = document.getElementById('suggestionActions');

  const remaining = list.querySelectorAll('.suggestion-item');
  if (remaining.length === 0) {
    container.classList.add('hidden');
    return;
  }
  countEl.textContent = remaining.length;
  const items = Array.from(remaining).map(el => ({
    cat: el.querySelector('.suggestion-item-to')?.textContent || ''
  }));
  const newCats = [...new Set(items.map(i => i.cat))];
  summaryEl.textContent = t('suggestionSummary', {
    count: remaining.length,
    categories: newCats.join('、')
  });
  document.getElementById('applyAllSuggestionsBtn').disabled = false;
  document.getElementById('applyAllSuggestionsBtn').textContent = t('suggestionApplyAll');
}

function bindPreviewEvents() {
  document.getElementById('previewList').addEventListener('click', (e) => {
    const header = e.target.closest('.preview-category-header');
    if (header) {
      const category = header.parentElement;
      const items = category.querySelector('.preview-category-items');
      items.classList.toggle('collapsed');
    }
  });
}

function bindEvents() {
  document.getElementById('analyzeBtn').addEventListener('click', handleAnalyze);
  document.getElementById('organizeBtn').addEventListener('click', handleOrganize);
  document.getElementById('startOrganizeBtn').addEventListener('click', handleStartOrganize);
  document.getElementById('cancelOrganizeBtn').addEventListener('click', handleCancelOrganize);
  document.getElementById('undoBtn').addEventListener('click', handleUndo);
  document.getElementById('backBtn').addEventListener('click', showMainView);
  document.getElementById('restoreBtn').addEventListener('click', handleRestore);
  document.getElementById('restoreFooterBtn').addEventListener('click', handleRestore);
  document.getElementById('exportBtn').addEventListener('click', handleExport);
  document.getElementById('aiToggleCheckbox').addEventListener('change', handleAiToggle);
  document.getElementById('cancelAnalysisBtn').addEventListener('click', handleCancelAnalysis);
  document.getElementById('optionsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('tabBookmarks').addEventListener('click', () => switchTab('bookmark'));
  document.getElementById('tabHistory').addEventListener('click', () => switchTab('history'));
  document.getElementById('refreshHistoryBtn').addEventListener('click', () => loadHistory());

  // Support modal
  document.getElementById('supportBtn').addEventListener('click', showSupportModal);
  document.getElementById('supportModalClose').addEventListener('click', hideSupportModal);
  document.getElementById('supportModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideSupportModal();
  });
}

function showSupportModal() {
  document.getElementById('supportModal').classList.remove('hidden');
}

function hideSupportModal() {
  document.getElementById('supportModal').classList.add('hidden');
}

function switchTab(tab) {
  const bookmarkTab = document.getElementById('bookmarkTab');
  const historyTab = document.getElementById('historyTab');
  const tabBookmarks = document.getElementById('tabBookmarks');
  const tabHistory = document.getElementById('tabHistory');

  if (tab === 'bookmark') {
    bookmarkTab.hidden = false;
    historyTab.hidden = true;
    tabBookmarks.classList.add('active');
    tabHistory.classList.remove('active');
  } else {
    bookmarkTab.hidden = true;
    historyTab.hidden = false;
    tabBookmarks.classList.remove('active');
    tabHistory.classList.add('active');
    loadHistory();
  }
}

async function loadHistory() {
  const list = document.getElementById('historyList');
  list.innerHTML = `<p class="history-loading">${t('historyLoading')}</p>`;

  try {
    const summary = await chrome.runtime.sendMessage({ action: 'getHistory' });

    document.getElementById('totalVisits').textContent = summary.totalVisits?.toLocaleString() || '0';
    document.getElementById('uniqueDomains').textContent = summary.uniqueDomains?.toLocaleString() || '0';
    document.getElementById('uniqueUrls').textContent = summary.uniqueUrls?.toLocaleString() || '0';
    document.getElementById('historyPeriod').textContent = t('historyPeriod', { months: summary.periodMonths || 3 });

    if (!summary.topSites || summary.topSites.length === 0) {
      list.innerHTML = `<p class="history-empty">${t('historyEmpty')}</p>`;
      return;
    }

    const maxVisits = Math.max(...summary.topSites.map(s => s.visits), 1);

    list.innerHTML = summary.topSites.slice(0, 20).map((site, i) => {
      const barWidth = Math.max(2, Math.round((site.visits / maxVisits) * 100));
      const lastVisit = formatTimeAgo(site.lastVisit);
      return `
        <div class="history-item">
          <div class="history-rank">${i + 1}</div>
          <div class="history-info">
            <div class="history-domain" title="${escapeHtml(site.sampleUrl || site.domain)}">
              <span class="history-favicon">🌐</span>
              ${escapeHtml(site.domain)}
            </div>
            <div class="history-title" title="${escapeHtml(site.title)}">${escapeHtml(site.title || site.domain)}</div>
            <div class="history-meta">
              <span class="history-visits">${t('visitsCount', { count: site.visits.toLocaleString() })}</span>
              <span class="history-last">${lastVisit}</span>
            </div>
          </div>
          <div class="history-bar-container">
            <div class="history-bar" style="width:${barWidth}%"></div>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    list.innerHTML = `<p class="history-empty">${t('historyLoadFail')}</p>`;
    console.error('加载历史失败:', e);
  }
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return '';
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t('justNow');
  if (minutes < 60) return t('minutesAgo', { n: minutes });
  if (hours < 24) return t('hoursAgo', { n: hours });
  if (days < 30) return t('daysAgo', { n: days });
  return t('monthsAgo', { n: Math.floor(days / 30) });
}

async function checkPendingAnalysis() {
  try {
    // 先检查是否有进行中的分析任务，恢复进度显示
    const progRes = await chrome.runtime.sendMessage({ action: 'getProgress' });
    if (progRes && progRes.progress && progRes.progress.status !== 'idle') {
      showProgress(progRes.progress.status, progRes.progress.processed, progRes.progress.total);
      document.getElementById('analyzeBtn').disabled = true;
      document.getElementById('analyzeBtn').textContent = t('progressCollecting');
      return;
    }

    // 再检查是否有已完成但未消费的持久化分析结果
    const res = await chrome.runtime.sendMessage({ action: 'checkAnalysisResult' });
    if (!res.found || !res.results || res.results.length === 0) return;

    // 持久化分析结果可用，恢复预览状态
    analysisResult = { results: res.results, total: res.total };
    const analyzeBtn = document.getElementById('analyzeBtn');
    const organizeBtn = document.getElementById('organizeBtn');
    analyzeBtn.textContent = t('btnReanalyze');
    organizeBtn.disabled = false;
    renderPreview(res.results);
  } catch (e) {
    // 没有待处理的持久化结果或进行中的任务，正常流程
  }
}

async function checkUndoState() {
  try {
    const { snapshot } = await chrome.runtime.sendMessage({ action: 'getSnapshot' });
    if (snapshot && snapshot.length > 0) {
      document.getElementById('undoBtn').classList.remove('hidden');
    }
  } catch (e) {}
}

function showProgress(status, processed, total) {
  const container = document.getElementById('progressContainer');
  const fill = document.getElementById('progressFill');
  const text = document.getElementById('progressText');
  const cancelBtn = document.getElementById('cancelAnalysisBtn');

  if (status === 'idle' || status === 'complete' || status === 'done') {
    container.classList.add('hidden');
    cancelBtn.classList.add('hidden');
    stopProgressPoll();
    return;
  }

  container.classList.remove('hidden');
  cancelBtn.classList.remove('hidden');
  startProgressPoll();
  updateProgressBar(status, processed, total);
}

function updateProgressBar(status, processed, total) {
  const fill = document.getElementById('progressFill');
  const text = document.getElementById('progressText');
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
  fill.style.width = `${pct}%`;
  text.textContent = `${pct}%`;

  if (status === 'collecting') {
    text.textContent = t('progressCollecting');
  } else if (status === 'keyword_classify') {
    text.textContent = t('progressKeyword', { processed, total });
  } else if (status === 'llm_classifying') {
    text.textContent = t('progressLLM', { processed, total });
  } else if (status === 'fetching') {
    text.textContent = t('progressFetching', { processed, total });
  } else if (status === 'organizing') {
    text.textContent = t('progressOrganizing');
  } else if (status === 'undoing') {
    text.textContent = t('progressUndoing');
  }
}

// 轮询后台当前进度，确保弹窗始终显示最新值（即使推送消息有延迟）
function startProgressPoll() {
  if (_progressPollTimer) return;
  _progressPollTimer = setInterval(async () => {
    try {
      const res = await chrome.runtime.sendMessage({ action: 'getProgress' });
      if (!res || !res.progress) return;
      if (res.progress.status === 'idle' || res.progress.status === 'done' || res.progress.status === 'complete') {
        stopProgressPoll();
        return;
      }
      updateProgressBar(res.progress.status, res.progress.processed, res.progress.total);
    } catch (e) {
      // 弹窗关闭中或后台不可达，静默忽略
    }
  }, 800);
}

function stopProgressPoll() {
  if (_progressPollTimer) {
    clearInterval(_progressPollTimer);
    _progressPollTimer = null;
  }
}

async function handleAnalyze() {
  const analyzeBtn = document.getElementById('analyzeBtn');
  const organizeBtn = document.getElementById('organizeBtn');

  analyzeBtn.disabled = true;
  analyzeBtn.textContent = t('progressCollecting');
  showProgress('collecting', 0, 0);

  try {
    analysisResult = await chrome.runtime.sendMessage({ action: 'analyze' });

    if (analysisResult.cancelled) {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = t('btnAnalyze');
      showProgress('idle', 0, 0);
      return;
    }

    if (analysisResult.error) {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = t('btnAnalyze');
      showProgress('idle', 0, 0);
      console.error('分析异常中断:', analysisResult);
      return;
    }

    organizeBtn.disabled = false;
    analyzeBtn.textContent = t('btnReanalyze');
    analyzeBtn.disabled = false;

    renderPreview(analysisResult.results);
  } catch (e) {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = t('btnAnalyze');
    showProgress('idle', 0, 0);
    console.error('分析失败:', e);
  }
}

function renderPreview(results) {
  showProgress('idle', 0, 0);
  const container = document.getElementById('previewContainer');
  container.classList.remove('hidden');

  const grouped = {};
  for (const r of results) {
    if (!grouped[r.category]) grouped[r.category] = [];
    grouped[r.category].push(r);
  }

  const sorted = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);

  const list = document.getElementById('previewList');
  list.innerHTML = sorted.map(([category, items]) => {
    return `
      <div class="preview-category">
        <div class="preview-category-header">
          <span class="preview-category-name">📁 ${category}</span>
          <span class="preview-category-count">${t('previewCount', { count: items.length })}</span>
        </div>
        <div class="preview-category-items collapsed">
          ${items.slice(0, 10).map(item => `
            <div class="preview-item">
              <span class="preview-item-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</span>
              <span class="preview-item-confidence confidence-${item.confidence}">${confidenceLabel(item.confidence)}</span>
            </div>
          `).join('')}
          ${items.length > 10 ? `<div class="preview-item"><span class="preview-item-title" style="color:#888">${t('previewMore', { count: items.length - 10 })}</span></div>` : ''}
        </div>
      </div>
    `;
  }).join('');

  // Dry-run 确认区
  const categoryCount = Object.keys(grouped).length;
  document.getElementById('dryRunSummary').innerHTML =
    t('dryRunSummary', { count: results.length, categories: categoryCount });
  document.getElementById('dryRunActions').classList.remove('hidden');
  document.getElementById('organizeBtn').classList.add('hidden');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function confidenceLabel(confidence) {
  const map = { high: t('confidenceHigh'), medium: t('confidenceMedium'), low: t('confidenceLow') };
  return map[confidence] || confidence;
}

async function handleOrganize() {
  if (!analysisResult || !analysisResult.results.length) return;

  const btn = document.getElementById('organizeBtn');
  btn.disabled = true;
  btn.textContent = t('progressOrganizing');

  try {
    const result = await chrome.runtime.sendMessage({ action: 'organize' });
    showResult(result);
  } catch (e) {
    btn.disabled = false;
    btn.textContent = t('btnOrganize');
    console.error('整理失败:', e);
  }
}

async function handleStartOrganize() {
  if (!analysisResult || !analysisResult.results.length) return;

  const btn = document.getElementById('startOrganizeBtn');
  const cancelBtn = document.getElementById('cancelOrganizeBtn');
  btn.disabled = true;
  cancelBtn.disabled = true;
  btn.textContent = t('progressOrganizing');

  try {
    const result = await chrome.runtime.sendMessage({ action: 'organize' });
    if (result.cancelled) {
      btn.disabled = false;
      cancelBtn.disabled = false;
      btn.textContent = t('btnStartOrganize');
      return;
    }
    showResult(result);
  } catch (e) {
    btn.disabled = false;
    cancelBtn.disabled = false;
    btn.textContent = t('btnStartOrganize');
    console.error('整理失败:', e);
  }
}

function handleCancelOrganize() {
  showMainView();
}

function showResult(result) {
  showProgress('idle', 0, 0);
  document.getElementById('previewContainer').classList.add('hidden');
  document.getElementById('mainView').classList.add('hidden');
  document.getElementById('resultView').classList.remove('hidden');

  const content = document.getElementById('resultContent');

  if (result.success) {
    const stats = result.stats;
    const catsHtml = stats.categories.map(c => `
      <div class="result-stat">
        <span class="result-stat-name">${c.category}</span>
        <span class="result-stat-count">${c.count}</span>
      </div>
    `).join('');

    content.innerHTML = `
      <div class="result-icon">✅</div>
      <div class="result-title">${t('resultOrganizeDone')}</div>
      <div class="result-message">${t('resultOrganizeMsg', { moved: stats.moved, categories: stats.categories.length })}</div>
      <div class="result-stats">${catsHtml}</div>
    `;

    document.getElementById('undoBtn').classList.remove('hidden');
    document.getElementById('restoreBtn').classList.remove('hidden');
    document.getElementById('restoreFooterBtn').classList.remove('hidden');
  } else {
    content.innerHTML = `
      <div class="result-icon">⚠️</div>
      <div class="result-title">${t('resultOrganizeFail')}</div>
      <div class="result-message">${t('resultOrganizeFailMsg')}</div>
    `;
  }
}

function showMainView() {
  document.getElementById('resultView').classList.add('hidden');
  document.getElementById('mainView').classList.remove('hidden');
  document.getElementById('previewContainer').classList.add('hidden');
  document.getElementById('dryRunActions').classList.add('hidden');
  document.getElementById('startOrganizeBtn').disabled = false;
  document.getElementById('startOrganizeBtn').textContent = t('btnStartOrganize');
  document.getElementById('cancelOrganizeBtn').disabled = false;
  document.getElementById('restoreBtn').classList.add('hidden');
  document.getElementById('restoreFooterBtn').classList.add('hidden');
  if (analysisResult) {
    document.getElementById('organizeBtn').classList.remove('hidden');
    document.getElementById('organizeBtn').disabled = false;
    document.getElementById('organizeBtn').textContent = t('btnOrganize');
  }
  document.getElementById('analyzeBtn').textContent = analysisResult ? t('btnReanalyze') : t('btnAnalyze');
}

async function handleUndo() {
  const btn = document.getElementById('undoBtn');
  btn.disabled = true;
  btn.textContent = t('progressUndoing');

  try {
    const result = await chrome.runtime.sendMessage({ action: 'undo' });
    if (result.success) {
      btn.classList.add('hidden');
      btn.disabled = false;
      btn.textContent = t('btnUndo');
      analysisResult = null;
      showMainView();
    }
  } catch (e) {
    btn.disabled = false;
    btn.textContent = t('btnUndo');
    console.error('撤销失败:', e);
  }
}

async function handleExport() {
  try {
    const tree = await chrome.bookmarks.getTree();
    const json = JSON.stringify(tree, null, 2);
    downloadJson(json, `bookmarks-export-${new Date().toISOString().slice(0, 10)}.json`);
  } catch (e) {
    console.error('导出失败:', e);
  }
}

async function handleRestore() {
  try {
    const res = await chrome.runtime.sendMessage({ action: 'restoreFromBackup' });
    if (!res.success) {
      console.error('恢复失败:', res.message);
      return;
    }
    const ts = new Date(res.timestamp).toISOString().slice(0, 10);
    downloadJson(res.json, `bookmarks-backup-${ts}.json`);

    const content = document.getElementById('resultContent');
    const restoreBtn = document.getElementById('restoreBtn');
    restoreBtn.disabled = true;
    restoreBtn.textContent = t('resultRestoreBtn');
    content.innerHTML += `
      <div class="result-restore-hint">${t('resultRestoreMsg')}</div>
    `;
  } catch (e) {
    console.error('恢复失败:', e);
  }
}

function downloadJson(json, filename) {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function loadAiToggle() {
  try {
    const res = await chrome.runtime.sendMessage({ action: 'getAiToggle' });
    const inline = document.getElementById('aiToggleInline');
    const checkbox = document.getElementById('aiToggleCheckbox');
    const badge = document.getElementById('aiToggleBadge');

    inline.classList.remove('hidden');
    checkbox.checked = res.enabled;
    if (res.enabled) {
      badge.classList.add('on');
    } else {
      badge.classList.remove('on');
    }

    if (!res.llmConfigured) {
      inline.title = t('aiToggleNotConfigured');
    } else if (res.enabled) {
      inline.title = t('aiToggleOn');
    } else {
      inline.title = t('aiToggleOff');
    }
  } catch (e) {
    console.error('加载 AI 开关状态失败:', e);
  }
}

let toggleErrorTimer = null;

function showToggleError(msg) {
  const hint = document.getElementById('aiToggleHint');
  if (!hint) return;
  if (toggleErrorTimer) clearTimeout(toggleErrorTimer);
  hint.textContent = msg;
  hint.classList.remove('hidden', 'fadeout');
  void hint.offsetWidth;
  toggleErrorTimer = setTimeout(() => {
    hint.classList.add('fadeout');
    toggleErrorTimer = null;
  }, 2500);
}

async function handleAiToggle() {
  const checkbox = document.getElementById('aiToggleCheckbox');
  const badge = document.getElementById('aiToggleBadge');
  const inline = document.getElementById('aiToggleInline');
  const enabled = checkbox.checked;

  if (enabled) {
    const res = await chrome.runtime.sendMessage({ action: 'getAiToggle' });
    if (!res.llmConfigured) {
      checkbox.checked = false;
      badge.classList.remove('on');
      inline.title = t('aiToggleNeedConfig');
      showToggleError(t('aiToggleNeedConfig'));
      return;
    }
  }

  await chrome.runtime.sendMessage({ action: 'setAiToggle', enabled });
  badge.classList.toggle('on', enabled);
  inline.title = enabled ? t('aiToggleOn') : t('aiToggleOff');
}

async function handleCancelAnalysis() {
  await chrome.runtime.sendMessage({ action: 'cancelAnalysis' });
  showProgress('idle', 0, 0);
  const analyzeBtn = document.getElementById('analyzeBtn');
  analyzeBtn.disabled = false;
  analyzeBtn.textContent = analysisResult ? t('btnReanalyze') : t('btnAnalyze');
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'progress') {
    const { status, total, processed } = message.progress;
    showProgress(status, processed, total);
  }
});
