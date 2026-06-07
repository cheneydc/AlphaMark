import { CATEGORIES, DEFAULT_CONFIG } from './classifier.js';
import { getDefaultLLMConfig } from './llm.js';
import { DEFAULT_HISTORY_CONFIG } from './history.js';
import { t, initLang, applyI18nToDOM } from './i18n.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initLang();
    applyI18nToDOM();
    await loadAllSettings();
    loadCategories();
  } catch (e) {
    console.error('加载设置失败:', e);
  }
  bindEvents();
});

async function loadAllSettings() {
  const response = await chrome.runtime.sendMessage({ action: 'getConfig' });
  const config = response.config;
  const llmConfig = response.llmConfig;
  const historyConfig = response.historyConfig;

  document.getElementById('confidenceThreshold').value = config.confidenceThreshold;
  document.getElementById('thresholdValue').textContent = config.confidenceThreshold;
  document.getElementById('maxConcurrentFetches').value = config.maxConcurrentFetches;
  document.getElementById('fetchTimeout').value = config.fetchTimeout;
  document.getElementById('fetchPageContent').checked = config.fetchPageContent;
  document.getElementById('autoOrganizeOnBookmark').checked = config.autoOrganizeOnBookmark || false;

  const privacyStored = await chrome.storage.local.get('abookmark_privacy_config');
  const privacyConfig = privacyStored['abookmark_privacy_config'] || { allowHistory: true };
  document.getElementById('allowHistoryAccess').checked = privacyConfig.allowHistory;

  document.getElementById('llmEnabled').checked = llmConfig.enabled;
  document.getElementById('llmApiKey').value = llmConfig.apiKey || '';
  document.getElementById('llmMaxCategories').value = llmConfig.maxCategories || 10;
  document.getElementById('customModel').value = llmConfig.customModel || '';
  document.getElementById('customBaseUrl').value = llmConfig.customBaseUrl || '';
  updateLLMVisibility();

  document.getElementById('historyMonths').value = historyConfig.historyMonths;
  document.getElementById('includeHistoryInAnalysis').checked = historyConfig.includeHistoryInAnalysis;
  document.getElementById('topSitesCount').value = historyConfig.topSitesCount || 20;
}

function updateLLMVisibility() {
  const enabled = document.getElementById('llmEnabled').checked;
  document.getElementById('llmSettings').style.display = enabled ? 'block' : 'none';
}

function loadCategories() {
  const container = document.getElementById('categoriesList');
  container.innerHTML = '';
  for (const [name, data] of Object.entries(CATEGORIES)) {
    const keywords = data.keywords.map(k => k.word).join('\n');
    const div = document.createElement('div');
    div.className = 'category-item';
    div.innerHTML = `
      <div class="category-item-header">
        <span class="category-item-name">${name}</span>
        <div class="category-item-actions">
          <button class="btn-sm danger delete-category">${t('deleteCategory')}</button>
        </div>
      </div>
      <textarea class="category-item-keywords" rows="3" placeholder="${t('keywordsPlaceholder')}">${keywords}</textarea>
    `;
    div.querySelector('.delete-category').addEventListener('click', () => { if (confirm(t('confirmDelete'))) div.remove(); });
    container.appendChild(div);
  }
}

function bindEvents() {
  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  document.getElementById('resetBtn').addEventListener('click', resetSettings);
  document.getElementById('llmEnabled').addEventListener('change', updateLLMVisibility);
  document.getElementById('toggleApiKeyBtn').addEventListener('click', () => {
    const input = document.getElementById('llmApiKey');
    input.type = input.type === 'password' ? 'text' : 'password';
  });
  document.getElementById('testLLMBtn').addEventListener('click', handleTestLLM);
  document.getElementById('confidenceThreshold').addEventListener('input', (e) => {
    document.getElementById('thresholdValue').textContent = e.target.value;
  });

  document.getElementById('resetConsentBtn').addEventListener('click', async () => {
    await chrome.storage.local.remove('abookmark_user_consent');
    await chrome.storage.local.remove('abookmark_consent_declined');
    showToast(t('saved'));
  });

  // 添加分类按钮
  const addBtn = document.createElement('button');
  addBtn.className = 'add-category-btn';
  addBtn.textContent = '+ ' + t('addCategory');
  addBtn.addEventListener('click', () => {
    const name = prompt(t('addCategoryPrompt'));
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    const container = document.getElementById('categoriesList');
    const div = document.createElement('div');
    div.className = 'category-item';
    div.innerHTML = `
      <div class="category-item-header">
        <span class="category-item-name">${trimmed}</span>
        <div class="category-item-actions">
          <button class="btn-sm danger delete-category">${t('deleteCategory')}</button>
        </div>
      </div>
      <textarea class="category-item-keywords" rows="3" placeholder="${t('keywordsPlaceholder')}"></textarea>
    `;
    div.querySelector('.delete-category').addEventListener('click', () => {
      if (confirm(t('confirmDelete'))) div.remove();
    });
    container.appendChild(div);
  });
  document.getElementById('categoriesList').appendChild(addBtn);
}

async function handleTestLLM() {
  const btn = document.getElementById('testLLMBtn');
  const result = document.getElementById('testLLMResult');
  btn.disabled = true;
  btn.textContent = t('llmTesting');
  result.textContent = '';
  result.className = 'test-result';

  const config = {
    provider: 'custom',
    model: document.getElementById('customModel').value,
    apiKey: document.getElementById('llmApiKey').value,
    customBaseUrl: document.getElementById('customBaseUrl').value,
    customModel: document.getElementById('customModel').value,
    enabled: true
  };

  try {
    await chrome.runtime.sendMessage({ action: 'saveLLMConfig', config });
    const validation = await chrome.runtime.sendMessage({ action: 'validateLLM' });
    if (validation.valid) {
      result.textContent = t('llmTestResultSuccess');
      result.className = 'test-result success';
    } else {
      result.textContent = t('llmTestResultFail', { message: validation.message });
      result.className = 'test-result error';
    }
  } catch (e) {
    result.textContent = t('llmTestResultFail', { message: e.message });
    result.className = 'test-result error';
  } finally {
    btn.disabled = false;
    btn.textContent = t('llmTestBtn');
  }
}

async function sendMessageSafe(msg, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try { return await chrome.runtime.sendMessage(msg); } catch (e) {
      if (i === retries) throw e;
      await new Promise(r => setTimeout(r, 500));
    }
  }
}

async function saveSettings() {
  console.log('保存设置...');
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) { saveBtn.textContent = '⏳ 保存中...'; saveBtn.disabled = true; }

  if (document.getElementById('llmEnabled').checked) {
    const apiKey = document.getElementById('llmApiKey').value.trim();
    const baseUrl = document.getElementById('customBaseUrl').value.trim();
    if (!apiKey || !baseUrl) {
      showToast(t('llmRequiredFieldsMissing'), 'error');
      if (saveBtn) { saveBtn.textContent = '💾 保存设置'; saveBtn.disabled = false; }
      return;
    }
  }

  try {
    const featureConfig = {
      confidenceThreshold: parseInt(document.getElementById('confidenceThreshold').value),
      maxConcurrentFetches: parseInt(document.getElementById('maxConcurrentFetches').value),
      fetchTimeout: parseInt(document.getElementById('fetchTimeout').value),
      fetchPageContent: document.getElementById('fetchPageContent').checked,
      autoOrganizeOnBookmark: document.getElementById('autoOrganizeOnBookmark').checked
    };

    const llmConfig = {
      provider: 'custom',
      model: document.getElementById('customModel').value,
      apiKey: document.getElementById('llmApiKey').value,
      customBaseUrl: document.getElementById('customBaseUrl').value,
      customModel: document.getElementById('customModel').value,
      enabled: document.getElementById('llmEnabled').checked,
      maxCategories: parseInt(document.getElementById('llmMaxCategories').value) || 10,
      maxTokens: 4000,
      temperature: 0.3
    };

    const historyConfig = {
      historyMonths: parseInt(document.getElementById('historyMonths').value),
      topSitesCount: parseInt(document.getElementById('topSitesCount').value),
      includeHistoryInAnalysis: document.getElementById('includeHistoryInAnalysis').checked
    };

    await sendMessageSafe({ action: 'saveConfig', config: featureConfig });
    await sendMessageSafe({ action: 'saveLLMConfig', config: llmConfig });
    await sendMessageSafe({ action: 'saveHistoryConfig', config: historyConfig });
    await chrome.storage.local.set({ 'abookmark_privacy_config': { allowHistory: document.getElementById('allowHistoryAccess').checked } });

    const items = document.querySelectorAll('.category-item');
    const newCategories = {};
    items.forEach(item => {
      const name = item.querySelector('.category-item-name').textContent;
      const keywordsText = item.querySelector('.category-item-keywords').value;
      const keywords = keywordsText.split('\n').map(w => w.trim()).filter(w => w.length > 0)
        .map((w, i) => ({ word: w, weight: Math.max(3, 10 - Math.floor(i / 2)) }));
      if (keywords.length > 0) newCategories[name] = { keywords };
    });
    if (Object.keys(newCategories).length > 0) {
      await chrome.storage.local.set({ abookmark_categories: newCategories });
    }

    showToast();
    try { feedbackSaveBtn(); } catch (e) {}
  } catch (e) {
    console.error('保存设置失败:', e);
    if (saveBtn) { saveBtn.textContent = '❌ 保存失败'; saveBtn.disabled = false; }
  }
}

function feedbackSaveBtn() {
  const saveBtn = document.getElementById('saveBtn');
  if (!saveBtn) return;
  saveBtn.textContent = '✅ ' + t('saved');
  saveBtn.disabled = false;
  setTimeout(() => {
    if (saveBtn) saveBtn.textContent = t('btnSave');
  }, 3000);
}

async function resetSettings() {
  if (!confirm(t('confirmReset'))) return;
  const def = getDefaultLLMConfig();

  document.getElementById('confidenceThreshold').value = DEFAULT_CONFIG.confidenceThreshold;
  document.getElementById('thresholdValue').textContent = DEFAULT_CONFIG.confidenceThreshold;
  document.getElementById('maxConcurrentFetches').value = DEFAULT_CONFIG.maxConcurrentFetches;
  document.getElementById('fetchTimeout').value = DEFAULT_CONFIG.fetchTimeout;
  document.getElementById('fetchPageContent').checked = DEFAULT_CONFIG.fetchPageContent;
  document.getElementById('autoOrganizeOnBookmark').checked = DEFAULT_CONFIG.autoOrganizeOnBookmark;

  document.getElementById('llmEnabled').checked = def.enabled;
  document.getElementById('llmApiKey').value = '';
  document.getElementById('llmMaxCategories').value = def.maxCategories || 10;
  document.getElementById('customModel').value = '';
  document.getElementById('customBaseUrl').value = '';

  document.getElementById('historyMonths').value = DEFAULT_HISTORY_CONFIG.historyMonths;
  document.getElementById('includeHistoryInAnalysis').checked = DEFAULT_HISTORY_CONFIG.includeHistoryInAnalysis;
  document.getElementById('topSitesCount').value = DEFAULT_HISTORY_CONFIG.topSitesCount;

  updateLLMVisibility();
  await chrome.storage.sync.remove('abookmark_config');
  await chrome.storage.sync.remove('abookmark_llm_config');
  await chrome.storage.sync.remove('abookmark_history_config');
  await chrome.storage.local.remove('abookmark_categories');
  await chrome.storage.local.remove('abookmark_dynamic_categories');
  loadCategories();
  showToast();
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message || t('saved');
  toast.className = 'toast';
  if (type === 'error') toast.classList.add('error');
  toast.classList.remove('hidden');
  setTimeout(() => { if (toast) toast.classList.add('hidden'); }, 3000);
}
