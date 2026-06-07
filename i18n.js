// i18n - 国际化模块
// 支持中文/英文，自动根据浏览器语言设置

const LANG_STORAGE_KEY = 'abookmark_lang';

const translations = {
  zh: {
    // 通用
    appName: 'AlphaMark',
    settings: '设置',
    save: '保存设置',
    reset: '恢复默认',
    saved: '设置已保存',
    confirm: '确认',
    confirmReset: '确定要恢复默认设置吗？',
    confirmDelete: '确定要删除吗？',
    cancel: '取消',

    // Popup - 标签
    tabBookmarks: '书签整理',
    tabHistory: '访问历史',
    title: '📑 AlphaMark',

    // Popup - 状态
    loading: '正在加载...',
    cannotLoad: '无法获取书签',
    bookmarkCount: '共 {count} 个书签',
    totalBookmarks: '共 {count} 个书签',

    // Popup - 按钮
    btnAnalyze: '🔍 分析书签',
    btnReanalyze: '🔄 重新分析',
    btnOrganize: '📂 整理书签',
    btnUndo: '↩ 撤销整理',
    btnStartOrganize: '🚀 开始整理',
    btnCancelOrganize: '取消',
    btnCancelAnalysis: '✕ 取消分析',
    btnBack: '返回',
    btnExport: '导出书签备份',
    btnRestore: '↩ 从备份恢复',
    btnRefresh: '🔄 刷新',
    btnSave: '💾 保存设置',
    btnReset: '↩ 恢复默认',
    aiToggleOn: 'AI 已开启 — 分析时使用大模型',
    aiToggleOff: 'AI 已关闭 — 分析时使用本地分类',
    aiToggleNotConfigured: 'AI 未配置，请先在设置中配置大模型',
    aiToggleNeedConfig: '请先在设置中配置 AI 大模型后再开启',

    // Popup - 进度
    progressCollecting: '准备中...',
    progressKeyword: '关键词分类 {processed}/{total}',
    progressFetching: '抓取网页 {processed}/{total}',
    progressLLM: 'AI 分析中 {processed}/{total}',
    progressOrganizing: '整理中...',
    progressUndoing: '撤销中...',
    progressComplete: '完成! ({processed}/{total})',

    // Popup - 预览
    previewTitle: '分类预览',
    previewCount: '{count} 个书签',
    previewMore: '...及其他 {count} 个书签',
    dryRunSummary: '将整理 <span class="highlight">{count}</span> 个书签到 <span class="highlight">{categories}</span> 个分类文件夹',

    // Popup - LLM 建议
    suggestionTitle: 'LLM 分类建议',
    suggestionSummary: 'LLM 建议变更 {count} 个书签的分类，创建以下新分类：{categories}',
    suggestionApplyAll: '📂 应用所有变更',
    suggestionDismissAll: '✕ 全部忽略',
    suggestionFrom: '当前',
    suggestionTo: '建议',

    // Popup - 结果
    resultOrganizeDone: '整理完成!',
    resultOrganizeMsg: '已将 {moved} 个书签分类到 {categories} 个文件夹中',
    resultOrganizeFail: '整理失败',
    resultOrganizeFailMsg: '没有找到可整理的书签，请先分析',
    resultUndoDone: '已撤销!',
    resultUndoMsg: '已还原 {count} 个书签到原始位置',
    resultRestoreMsg: '备份已下载，请前往 chrome://bookmarks → 导入书签 来恢复',
    resultRestoreBtn: '已下载备份文件',

    // Popup - 历史
    historyPeriod: '最近 {months} 个月',
    historyLoading: '加载中...',
    historyEmpty: '暂无浏览记录',
    historyLoadFail: '加载失败，请检查历史记录权限',
    statTotalVisits: '总访问量',
    statUniqueDomains: '独立域名',
    statUniqueUrls: '独立页面',
    visitsCount: '{count} 次访问',
    justNow: '刚刚',
    minutesAgo: '{n} 分钟前',
    hoursAgo: '{n} 小时前',
    daysAgo: '{n} 天前',
    monthsAgo: '{n} 个月前',
    bookmarksCount: '共 {count} 个书签',

    // Options - 标题
    optionsTitle: '设置',
    pageTitle: 'AlphaMark - 设置',

    // Options - LLM
    sectionLLM: '🤖 AI 大模型设置',
    llmEnableLabel: '启用大模型智能分类',
    llmEnableHint: '启用后将调用大模型 API 进行书签分类，准确率更高但需要联网和 API Key',
    llmCustomModel: '模型名称',
    llmCustomModelPlaceholder: '例如: gpt-4o-mini',
    llmCustomUrl: 'API 地址',
    llmCustomUrlPlaceholder: '例如: https://api.openai.com/v1 （会自动补全 /chat/completions）',
    llmApiKey: 'API Key',
    llmApiKeyPlaceholder: '输入 API Key',
    llmActiveOnClassify: '分析书签时使用大模型',
    llmActiveOnClassifyHint: '启用后每次分析书签都会调用大模型进行分类',
    llmMaxCategories: '最大分类数',
    llmMaxCategoriesHint: '大模型最多创建多少个新分类（默认 10）',
    llmTestBtn: '🔗 测试连接',
    llmTestSuccess: '连接成功!',
    llmTestFail: '测试失败',
    llmTestResultSuccess: '✅ 连接成功!',
    llmTestResultFail: '❌ {message}',
    llmTesting: '⏳ 测试中...',
    llmNotEnabled: 'LLM 分类未启用',
    llmNoKey: '请先设置 API Key',
    llmConnectSuccess: '连接成功',
    llmRequiredFieldsMissing: '启用 AI 分析后，API 地址和 API Key 为必填项',

    // Options - 历史
    sectionHistory: '📊 历史记录分析',
    historyMonths: '分析时间范围 (月)',
    historyMonthsHint: '读取最近多少个月的浏览历史',
    historyMonths1: '1 个月',
    historyMonths3: '3 个月 (默认)',
    historyMonths6: '6 个月',
    historyMonths12: '12 个月',
    historyWeightLabel: '依据访问频率调整分类置信度',
    historyWeightHint: '经常访问的书签网站将获得更高的分类优先级',
    historyTopSites: '显示热门站点数量',
    historyTopSitesHint: '在弹出窗口中显示的常访网站数量',

    // Options - 分类设置
    sectionClassify: '分类设置',
    confidenceThreshold: '信任度阈值',
    confidenceHint: '低于此分数的书签将被归入「其他」分类',

    // Options - 抓取设置
    sectionFetch: '抓取设置',
    maxConcurrency: '最大并发请求数',
    maxConcurrencyHint: '同时抓取网页内容的最大数量',
    fetchTimeout: '请求超时 (毫秒)',
    fetchTimeoutHint: '单个网页内容抓取的超时时间',
    fetchContent: '抓取网页内容进行深度分析',
    fetchContentHint: '关闭后仅根据书签标题和 URL 进行分类，速度更快但准确率较低',

    // Options - 自动整理
    sectionAutoOrganize: '⚡ 自动整理',
    autoOrganizeLabel: '收藏书签时自动分类',
    autoOrganizeHint: '新增书签时自动分析并移入对应分类文件夹（仅高置信度触发）',

    // Options - 分类管理
    sectionCategories: '分类管理',
    categoriesDesc: '自定义你的分类类别和关键词，每行一个关键词',
    addCategory: '+ 添加新分类',
    addCategoryPrompt: '请输入新分类名称：',
    deleteCategory: '删除',
    keywordsPlaceholder: '每行一个关键词',

    // 置信度标签
    confidenceHigh: '高',
    confidenceMedium: '中',
    confidenceLow: '低',

    // 分类
    uncategorized: '未分类',

    // 赞赏支持 (popup modal)
    supportBtn: '☕ 赞赏',
    supportBtnTitle: '赞赏支持',
    supportModalTitle: '☕ 赞赏支持',
    supportModalDesc: '如果你喜欢 AlphaMark，欢迎扫码赞赏 ❤️',
    supportWechat: '微信',
    supportAlipay: '支付宝',

    // AI toggle
    aiToggleLabel: 'AI 分析',

    // Options - Support sidebar
    supportSidebarTitle: '☕ 赞赏支持',
    supportSidebarDesc: '如果你喜欢 AlphaMark，欢迎扫码赞赏 ❤️',
    supportSidebarWechat: '微信',
    supportSidebarAlipay: '支付宝',

    // Consent overlay
    consentTitle: '🔒 数据使用说明',
    consentDesc: 'AlphaMark 需要以下权限来完成书签整理功能：',
    consentBookmarks: '读取并分类书签',
    consentHistory: '浏览历史（按访问频率排序书签）',
    consentTab: '当前标签页（新书签时推荐分类）',
    consentLocal: '所有数据仅在本地处理，不会上传到任何服务器。',
    consentAI: 'AI 分析使用你自行配置的 API Key，数据直接发送到你指定的端点。',
    consentPrivacy: '查看隐私政策',
    consentAccept: '同意并继续',
    consentDecline: '暂不启用',
    consentDeclinedMsg: '你已拒绝数据使用授权。AlphaMark 将无法正常运行。你可以随时在设置页面重新开启。',
    consentGoSettings: '前往设置',
    consentDismiss: '知道了',

    // Privacy settings (options)
    sectionPrivacy: '📋 隐私设置',
    privacyHistoryLabel: '允许读取浏览历史',
    privacyHistoryHint: '关闭后分类时将不考虑访问频率权重',
    privacyConsentReset: '重置数据使用授权',
    privacyConsentResetHint: '重新显示首次使用的数据使用说明弹窗',
    privacyConsentResetBtn: '重置授权',
  },

  en: {
    // General
    appName: 'AlphaMark',
    settings: 'Settings',
    save: '💾 Save Settings',
    reset: '↩ Reset Defaults',
    saved: 'Settings saved',
    confirm: 'Confirm',
    cancel: 'Cancel',
    confirmReset: 'Are you sure you want to reset to defaults?',
    confirmDelete: 'Are you sure you want to delete?',

    // Popup - Tabs
    tabBookmarks: 'Bookmarks',
    tabHistory: 'History',
    title: '📑 AlphaMark',

    // Popup - Status
    loading: 'Loading...',
    cannotLoad: 'Cannot load bookmarks',
    bookmarkCount: '{count} bookmarks',
    totalBookmarks: '{count} bookmarks',

    // Popup - Buttons
    btnAnalyze: '🔍 Analyze',
    btnReanalyze: '🔄 Re-analyze',
    btnOrganize: '📂 Organize',
    btnUndo: '↩ Undo',
    btnStartOrganize: '🚀 Start Organizing',
    btnCancelOrganize: 'Cancel',
    btnCancelAnalysis: '✕ Cancel Analysis',
    btnBack: 'Back',
    btnExport: 'Export bookmarks',
    btnRestore: '↩ Restore from Backup',
    btnRefresh: '🔄 Refresh',
    btnSave: '💾 Save Settings',
    btnReset: '↩ Reset Defaults',
    aiToggleOn: 'AI on — LLM classification active',
    aiToggleOff: 'AI off — local classification only',
    aiToggleNotConfigured: 'AI not configured, please set up in settings',
    aiToggleNeedConfig: 'Please configure AI model in settings first',

    // Popup - Progress
    progressCollecting: 'Preparing...',
    progressKeyword: 'Keyword classify {processed}/{total}',
    progressFetching: 'Fetching pages {processed}/{total}',
    progressLLM: 'AI analyzing {processed}/{total}',
    progressOrganizing: 'Organizing...',
    progressUndoing: 'Undoing...',
    progressComplete: 'Done! ({processed}/{total})',

    // Popup - Preview
    previewTitle: 'Classification Preview',
    previewCount: '{count} bookmarks',
    previewMore: '...and {count} more bookmarks',
    dryRunSummary: 'Will organize <span class="highlight">{count}</span> bookmarks into <span class="highlight">{categories}</span> folders',

    // Popup - LLM Suggestions
    suggestionTitle: 'LLM Suggestions',
    suggestionSummary: 'LLM suggests updating {count} bookmarks, creating new categories: {categories}',
    suggestionApplyAll: '📂 Apply All Changes',
    suggestionDismissAll: '✕ Dismiss All',
    suggestionFrom: 'Current',
    suggestionTo: 'Suggested',

    // Popup - Results
    resultOrganizeDone: 'Organization Complete!',
    resultOrganizeMsg: 'Moved {moved} bookmarks into {categories} folders',
    resultOrganizeFail: 'Organization Failed',
    resultOrganizeFailMsg: 'No bookmarks found to organize. Please analyze first.',
    resultUndoDone: 'Undo Complete!',
    resultUndoMsg: 'Restored {count} bookmarks to original positions',
    resultRestoreMsg: 'Backup downloaded. Go to chrome://bookmarks → Import bookmarks to restore',
    resultRestoreBtn: 'Downloaded',

    // Popup - History
    historyPeriod: 'Last {months} months',
    historyLoading: 'Loading...',
    historyEmpty: 'No browsing history',
    historyLoadFail: 'Failed to load history. Please check history permission.',
    statTotalVisits: 'Total Visits',
    statUniqueDomains: 'Unique Domains',
    statUniqueUrls: 'Unique URLs',
    visitsCount: '{count} visits',
    justNow: 'Just now',
    minutesAgo: '{n} min ago',
    hoursAgo: '{n} hours ago',
    daysAgo: '{n} days ago',
    monthsAgo: '{n} months ago',
    bookmarksCount: '{count} bookmarks',

    // Options - Title
    optionsTitle: 'Settings',
    pageTitle: 'AlphaMark - Settings',

    // Options - LLM
    sectionLLM: '🤖 AI Model Settings',
    llmEnableLabel: 'Enable AI Classification',
    llmEnableHint: 'Uses LLM API for bookmark classification. More accurate but requires internet and API Key.',
    llmCustomModel: 'Model Name',
    llmCustomModelPlaceholder: 'e.g. gpt-4o-mini',
    llmCustomUrl: 'API URL',
    llmCustomUrlPlaceholder: 'e.g. https://api.openai.com/v1 (auto-appends /chat/completions)',
    llmApiKey: 'API Key',
    llmApiKeyPlaceholder: 'Enter API Key',
    llmActiveOnClassify: 'Use LLM when analyzing bookmarks',
    llmActiveOnClassifyHint: 'Uses LLM for bookmark classification',
    llmMaxCategories: 'Max Categories',
    llmMaxCategoriesHint: 'Max new categories LLM can create (default 10)',
    llmTestBtn: '🔗 Test Connection',
    llmTestSuccess: 'Connection successful!',
    llmTestFail: 'Test failed',
    llmTestResultSuccess: '✅ Connection successful!',
    llmTestResultFail: '❌ {message}',
    llmTesting: '⏳ Testing...',
    llmNotEnabled: 'LLM classification is not enabled',
    llmNoKey: 'Please configure API Key first',
    llmConnectSuccess: 'Connection successful',
    llmRequiredFieldsMissing: 'API URL and API Key are required when AI analysis is enabled',

    // Options - History
    sectionHistory: '📊 History Analysis',
    historyMonths: 'Analysis Period (months)',
    historyMonthsHint: 'How many months of history to read',
    historyMonths1: '1 month',
    historyMonths3: '3 months (default)',
    historyMonths6: '6 months',
    historyMonths12: '12 months',
    historyWeightLabel: 'Adjust confidence by visit frequency',
    historyWeightHint: 'Frequently visited sites get higher classification priority',
    historyTopSites: 'Top Sites Count',
    historyTopSitesHint: 'Number of top sites to show in popup',

    // Options - Classification Settings
    sectionClassify: 'Classification Settings',
    confidenceThreshold: 'Confidence Threshold',
    confidenceHint: 'Bookmarks scoring below this are placed in "Other"',

    // Options - Fetch Settings
    sectionFetch: 'Fetch Settings',
    maxConcurrency: 'Max Concurrent Requests',
    maxConcurrencyHint: 'Maximum simultaneous page content fetches',
    fetchTimeout: 'Request Timeout (ms)',
    fetchTimeoutHint: 'Timeout for fetching a single page',
    fetchContent: 'Fetch page content for deep analysis',
    fetchContentHint: 'Disable to classify by title and URL only (faster but less accurate)',

    // Options - Auto Organize
    sectionAutoOrganize: '⚡ Auto Organize',
    autoOrganizeLabel: 'Auto-classify on bookmark',
    autoOrganizeHint: 'Classify and move new bookmarks to matching folders (high confidence only)',

    // Options - Categories
    sectionCategories: 'Category Management',
    categoriesDesc: 'Customize your categories and keywords, one per line',
    addCategory: '+ Add Category',
    addCategoryPrompt: 'Enter new category name:',
    deleteCategory: 'Delete',
    keywordsPlaceholder: 'One keyword per line',

    // Confidence labels
    confidenceHigh: 'High',
    confidenceMedium: 'Medium',
    confidenceLow: 'Low',

    // Categories
    uncategorized: 'Uncategorized',

    // Support (popup modal)
    supportBtn: '☕ Support',
    supportBtnTitle: 'Support this project',
    supportModalTitle: '☕ Support AlphaMark',
    supportModalDesc: 'If you like AlphaMark, scan to support ❤️',
    supportWechat: 'WeChat',
    supportAlipay: 'Alipay',

    // AI toggle
    aiToggleLabel: 'AI Analyze',

    // Options - Support sidebar
    supportSidebarTitle: '☕ Support AlphaMark',
    supportSidebarDesc: 'If you like AlphaMark, scan to support ❤️',
    supportSidebarWechat: 'WeChat',
    supportSidebarAlipay: 'Alipay',

    // Consent overlay
    consentTitle: '🔒 Data Usage Notice',
    consentDesc: 'AlphaMark needs the following permissions to organize your bookmarks:',
    consentBookmarks: 'Read and classify bookmarks',
    consentHistory: 'Browsing history (sort bookmarks by visit frequency)',
    consentTab: 'Current tab (suggest category for new bookmarks)',
    consentLocal: 'All data is processed locally and never uploaded to any server.',
    consentAI: 'AI analysis uses your own API key. Data is sent directly to your configured endpoint.',
    consentPrivacy: 'View Privacy Policy',
    consentAccept: 'Accept & Continue',
    consentDecline: 'Not Now',
    consentDeclinedMsg: 'You declined data usage authorization. AlphaMark will not function properly. You can re-enable it in settings at any time.',
    consentGoSettings: 'Go to Settings',
    consentDismiss: 'Got it',

    // Privacy settings (options)
    sectionPrivacy: '📋 Privacy Settings',
    privacyHistoryLabel: 'Allow browsing history access',
    privacyHistoryHint: 'When disabled, classification will not consider visit frequency',
    privacyConsentReset: 'Reset data consent',
    privacyConsentResetHint: 'Show the data usage notice again on next popup open',
    privacyConsentResetBtn: 'Reset Consent',
  }
};

let currentLang = 'zh';

function detectLang() {
  try {
    // Primary: detect by timezone (user's actual location)
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      const cnTimezones = [
        'Asia/Shanghai', 'Asia/Chongqing', 'Asia/Urumqi',
        'Asia/Harbin', 'Asia/Kashgar', 'Asia/Macau', 'Asia/Hong_Kong'
      ];
      if (cnTimezones.includes(tz)) return 'zh';
      // Also treat Taiwan, Singapore timezones as Chinese-adjacent
      // (both are in UTC+8 and commonly use Chinese)
      if (tz === 'Asia/Taipei') return 'zh';
    }
    // Fallback: browser language
    const navLang = navigator.language || navigator.userLanguage || '';
    if (navLang.startsWith('zh')) return 'zh';
    const acceptLangs = navigator.languages || [];
    for (const l of acceptLangs) {
      if (l.startsWith('zh')) return 'zh';
    }
    return 'en';
  } catch (e) {
    return 'en';
  }
}

function getRegion() {
  // 根据语言判断是国内用户还是国外用户
  const lang = detectLang();
  return lang === 'zh' ? 'cn' : 'intl';
}

async function initLang() {
  try {
    const stored = await chrome.storage.sync.get(LANG_STORAGE_KEY);
    if (stored[LANG_STORAGE_KEY]) {
      currentLang = stored[LANG_STORAGE_KEY];
    } else {
      currentLang = detectLang();
      await chrome.storage.sync.set({ [LANG_STORAGE_KEY]: currentLang });
    }
  } catch (e) {
    currentLang = detectLang();
  }
  return currentLang;
}

async function setLang(lang) {
  if (lang !== 'zh' && lang !== 'en') return;
  currentLang = lang;
  try {
    await chrome.storage.sync.set({ [LANG_STORAGE_KEY]: lang });
  } catch (e) {}
}

function t(key, params = {}) {
  const dict = translations[currentLang] || translations.zh;
  let text = dict[key] || translations.zh[key] || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, v);
    }
  }
  return text;
}

function applyI18nToDOM(root) {
  if (!root) root = document;
  const elements = root.querySelectorAll('[data-i18n]');
  for (const el of elements) {
    const key = el.getAttribute('data-i18n');
    const attr = el.getAttribute('data-i18n-attr') || 'textContent';
    if (attr === 'textContent') {
      el.textContent = t(key);
    } else {
      el.setAttribute(attr, t(key));
    }
  }
  const placeholders = root.querySelectorAll('[data-i18n-placeholder]');
  for (const el of placeholders) {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  }
}

export { t, initLang, setLang, getRegion, applyI18nToDOM };
