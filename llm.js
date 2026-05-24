// LLM 抽象层 — 用户手动配置，不内置任何提供商

const LLM_PROVIDERS = {
  custom: {
    name: '自定义 LLM',
    requiresAuth: true,
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    buildUrl: (_, __, providerConfig) => {
      let url = (providerConfig.customBaseUrl || '').replace(/\/+$/, '');
      // OpenAI 兼容接口补全路径
      if (url && !url.endsWith('/chat/completions')) {
        url += '/chat/completions';
      }
      return url;
    },
    buildBody: (messages, model, config) => ({
      model,
      messages,
      temperature: config?.temperature ?? 0.3,
      max_tokens: config?.maxTokens ?? 4000
    }),
    parseResponse: (data) => data.choices?.[0]?.message?.content || ''
  }
};

const STORAGE_DYNAMIC_CATEGORIES_KEY = 'abookmark_dynamic_categories';

const DEFAULT_LLM_CONFIG = {
  provider: 'custom',
  model: '',
  apiKey: '',
  customBaseUrl: '',
  customModel: '',
  enabled: false,
  batchSize: 30,
  maxTokens: 4000,
  temperature: 0.3,
  maxCategories: 10
};

async function buildClassifyPrompt(bookmarks, categories, llmConfig) {
  // 检测用户语言（优先 chrome.i18n，兼容 service worker）
  let isZh = false;
  try { isZh = chrome.i18n.getUILanguage().startsWith('zh'); } catch (e) {}
  if (!isZh) {
    try { isZh = (navigator.language || '').startsWith('zh'); } catch (e) {}
  }

  // 始终使用中文分类名（与关键词引擎一致）；英文用户后续扩展
  const catList = categories.map(c => `"${c}"`).join(', ');
  const maxNew = llmConfig?.maxCategories || 10;
  const items = bookmarks.map((b, i) => {
    return `${i + 1}. ${isZh ? '标题' : 'Title'}: ${b.title}\n   URL: ${b.url}`;
  }).join('\n\n');

  const systemPrompt = isZh
    ? `你是一个专业的网页分类助手。请根据书签的标题、URL 和网页内容，将每个书签分配到最合适的类别。

可用类别: ${catList}

核心原则：合理抽象归类。不要直接用网站名、产品名、工具名作为分类（如 "React" 应归入 "技术与编程"，"Figma" 应归入 "设计与创意"），而是思考这个书签属于哪个领域、行业或主题。只有当一批书签确实共同指向某个已有类别完全无法覆盖的新主题时，才创建新分类。

规则:
1. 每个书签只能分配一个类别
2. 属于同一领域的具体技术、工具、框架、网站，应归入其所属的领域类别，而不是各自创建新分类。例如：多个编程相关网站 → "技术与编程"，多个烹饪食谱网站 → "美食烹饪"
3. 优先使用已有的可用类别。新类别只有在现有列表确实无法涵盖时才创建
4. 新创建的类别总数不能超过 ${maxNew} 个
5. 新类别名用中文，2-4 字，简短精准，反映多个书签的共同属性
6. 不允许使用"其他"、"未分类"、"网页"作为类别
7. 返回纯 JSON 数组，每个元素格式: {"index": <序号>, "category": "<类别名>", "reason": "<简短理由>"}
8. 序号必须从 1 开始，与输入顺序一致
9. 只返回 JSON 数组，不要任何额外文字`
    : `You are a professional bookmark classification assistant. Classify each bookmark into the most suitable category based on its title, URL and page content.

Available categories: ${catList}

Core principle: Abstract into reasonable categories. Do NOT use a website name, product name, or tool name directly as a category name (e.g., "React" → "Technology", "Figma" → "Design"). Instead, think about which domain, industry, or topic the bookmark belongs to. Only create a new category when a group of bookmarks genuinely shares a theme that no existing category can cover.

Rules:
1. Each bookmark belongs to exactly one category
2. Group specific technologies, tools, frameworks, and websites under their broader domain. For example: multiple programming-related sites → "Technology", multiple recipe sites → "Food"
3. Prefer existing categories. Only create a new one when the existing list truly cannot accommodate the bookmark
4. At most ${maxNew} new categories in total
5. New category names must be in English, 1-3 words, concise and clear, reflecting the shared attribute of multiple bookmarks
6. Do NOT use "Other", "Uncategorized", or "Web" as a category name
7. Return a pure JSON array, each item: {"index": <number>, "category": "<name>", "reason": "<brief reason>"}
8. Index starts at 1, matching input order
9. Return ONLY the JSON array, no extra text`;

  return {
    system: systemPrompt,
    user: `${isZh ? `请对以下 ${bookmarks.length} 个书签进行分类` : `Classify the following ${bookmarks.length} bookmarks`}:\n\n${items}`
  };
}

async function callLLM(provider, model, messages, config, cancelSignal) {
  const providerConfig = typeof provider === 'string' ? LLM_PROVIDERS[provider] : provider;
  if (!providerConfig) {
    throw new Error(`未知的 LLM 提供商: ${provider}`);
  }

  const apiKey = config.apiKey;
  if (providerConfig.requiresAuth && !apiKey) {
    throw new Error(`请先在设置中配置 ${providerConfig.name} 的 API Key`);
  }

  const url = providerConfig.buildUrl(model, apiKey, config);
  const headers = providerConfig.headers(apiKey, config);
  const body = providerConfig.buildBody(messages, model, config);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  if (cancelSignal) {
    cancelSignal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 请求失败 (${response.status})\n地址: ${url}\n响应: ${errorText.slice(0, 200)}`);
    }

    const data = await response.json();
    return providerConfig.parseResponse(data);
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

function parseClassificationResult(text, expectedCount) {
  try {
    const cleaned = text.trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const results = JSON.parse(cleaned);
    if (!Array.isArray(results)) {
      throw new Error('LLM 返回的不是数组');
    }

    const map = {};
    for (const item of results) {
      map[item.index] = { category: item.category, reason: item.reason };
    }
    return map;
  } catch (e) {
    console.error('解析 LLM 分类结果失败:', e);
    return null;
  }
}

async function classifyBatchWithLLM(bookmarks, config, cancelSignal) {
  const { provider, model } = config;

  const categoryNames = await getAllCategoryNames();

  const prompt = await buildClassifyPrompt(bookmarks, categoryNames, config);
  const messages = [
    { role: 'system', content: prompt.system },
    { role: 'user', content: prompt.user }
  ];

  const text = await callLLM(provider, model, messages, config, cancelSignal);
  const parsed = parseClassificationResult(text, bookmarks.length);

  if (!parsed) {
    return null;
  }

  const results = [];
  const newCategories = new Set();

  // 加载中英文分类名映射
  let catNameEnToZh = {};
  try {
    const mod = await import(chrome.runtime.getURL('classifier.js'));
    catNameEnToZh = Object.fromEntries(
      Object.entries(mod.CATEGORY_NAMES_EN || {}).map(([zh, en]) => [en.toLowerCase(), zh])
    );
  } catch (e) {}

  for (let i = 0; i < bookmarks.length; i++) {
    const llmResult = parsed[i + 1];
    let category = '';
    if (llmResult && llmResult.category) {
      category = llmResult.category.trim();
      if (category === '其他' || category === 'Other') category = '';
      // 英文分类名映射回中文（如果用户是英文界面，LLM 可能返回英文名）
      if (category && catNameEnToZh[category.toLowerCase()]) {
        category = catNameEnToZh[category.toLowerCase()];
      }
    }
    // LLM 没给出有效分类 → 用域名兜底
    if (!category) {
      try {
        const hostname = new URL(bookmarks[i].url).hostname;
        const name = hostname
          .replace(/^www\d*\./i, '')
          .split('.')[0]
          .replace(/[^a-zA-Z0-9\u4e00-\u9fff_-]/g, '')
          .trim();
        if (name) category = name.charAt(0).toUpperCase() + name.slice(1);
      } catch (e) {}
      if (!category) category = '网页';
    }
    if (!categoryNames.includes(category)) {
      newCategories.add(category);
    }
    results.push({
      category,
      confidence: 'high',
      score: 100,
      llmReason: llmResult?.reason || '',
      source: 'llm'
    });
  }

  // 限制新分类数量：保留最热门的前 N 个，多余的合并到已有分类
  const maxNew = config.maxCategories || 10;
  if (newCategories.size > maxNew) {
    // 统计每个新分类的书签数
    const countMap = {};
    for (const r of results) {
      if (newCategories.has(r.category)) {
        countMap[r.category] = (countMap[r.category] || 0) + 1;
      }
    }
    // 按书签数排序，保留前 maxNew 个
    const sorted = Object.entries(countMap).sort((a, b) => b[1] - a[1]);
    const keep = new Set(sorted.slice(0, maxNew).map(([c]) => c));
    const removed = new Set([...newCategories].filter(c => !keep.has(c)));
    newCategories.clear();
    for (const c of keep) newCategories.add(c);

    // 被淘汰的新分类书签：尝试用关键词重新分，否则用域名兜底
    for (const r of results) {
      if (removed.has(r.category)) {
        let fallback = '';
        const idx = results.indexOf(r);
        const bm = bookmarks[idx];
        try {
          const hostname = new URL(bm.url).hostname;
          const name = hostname.replace(/^www\d*\./i, '').split('.')[0].replace(/[^a-zA-Z0-9\u4e00-\u9fff_-]/g, '').trim();
          if (name) fallback = name.charAt(0).toUpperCase() + name.slice(1);
        } catch (e) {}
        r.category = fallback || '网页';
      }
    }
  }

  // 持久化 LLM 新发现的分类
  if (newCategories.size > 0) {
    await saveLLMNewCategories(Array.from(newCategories));
  }

  return { results, newCategories: Array.from(newCategories) };
}

async function singleClassifyWithLLM(bookmark, config) {
  const batchResult = await classifyBatchWithLLM([bookmark], config);
  if (batchResult && batchResult.results && batchResult.results.length > 0) {
    return batchResult.results[0];
  }
  return null;
}

async function getDynamicCategories() {
  try {
    const stored = await chrome.storage.local.get(STORAGE_DYNAMIC_CATEGORIES_KEY);
    return stored[STORAGE_DYNAMIC_CATEGORIES_KEY] || [];
  } catch (e) {
    return [];
  }
}

async function saveLLMNewCategories(newCats) {
  try {
    const existing = await getDynamicCategories();
    const merged = Array.from(new Set([...existing, ...newCats]));
    await chrome.storage.local.set({ [STORAGE_DYNAMIC_CATEGORIES_KEY]: merged });
  } catch (e) {
    console.error('保存 LLM 发现的新分类失败:', e);
  }
}

async function getStaticCategoryNames() {
  try {
    const stored = await chrome.storage.local.get('abookmark_categories');
    if (stored.abookmark_categories && Object.keys(stored.abookmark_categories).length > 0) {
      return Object.keys(stored.abookmark_categories);
    }
  } catch (e) {}

  try {
    const module = await import(chrome.runtime.getURL('classifier.js'));
    return Object.keys(module.CATEGORIES);
  } catch (e) {}

  return [
    "社交与通讯", "新闻与资讯", "技术与编程", "购物与电商",
    "娱乐与视频", "教育学习", "金融理财", "旅游出行",
    "美食烹饪", "体育健身", "健康医疗", "效率工具",
    "设计与创意", "政府与参考", "网页"
  ];
}

async function getAllCategoryNames() {
  const staticNames = await getStaticCategoryNames();
  const dynamicNames = await getDynamicCategories();
  return Array.from(new Set([...staticNames, ...dynamicNames]));
}

async function validateLLMConfig(config) {
  if (!config.enabled) {
    return { valid: false, message: 'LLM 分类未启用' };
  }
  if (!config.apiKey) {
    return { valid: false, message: '请先设置 API Key' };
  }
  if (!config.customBaseUrl) {
    return { valid: false, message: '请填写 API 地址' };
  }
  if (!config.model && !config.customModel) {
    return { valid: false, message: '请填写模型名称' };
  }
  try {
    const model = config.model || config.customModel;
    const testMessages = [
      { role: 'system', content: '你是一个网页分类助手。' },
      { role: 'user', content: '测试连接，请回复"OK"' }
    ];
    const text = await callLLM(config.provider, model, testMessages, config);
    return { valid: !!text, message: '连接成功' };
  } catch (e) {
    let msg = e.message;
    // 提取 JSON 错误中的 message 字段，让提示更简洁
    const jsonMatch = msg.match(/"message"\s*:\s*"([^"]+)"/);
    if (jsonMatch) msg = `服务器返回: ${jsonMatch[1]}`;
    // 对常见错误给出可操作提示
    if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('Authentication')) {
      msg = 'API Key 无效或未授权，请检查 API Key';
    } else if (msg.includes('500')) {
      msg = '服务器内部错误，请检查模型名称和 API Key 是否正确';
    } else if (msg.includes('model')) {
      msg = '模型名称不正确，请检查模型名称';
    }
    return { valid: false, message: msg };
  }
}

// ========== 默认配置 ==========
function getDefaultLLMConfig() {
  return { ...DEFAULT_LLM_CONFIG };
}

export { LLM_PROVIDERS, DEFAULT_LLM_CONFIG, getDefaultLLMConfig, callLLM, classifyBatchWithLLM, singleClassifyWithLLM, validateLLMConfig, getStaticCategoryNames, getDynamicCategories, getAllCategoryNames, saveLLMNewCategories, buildClassifyPrompt, parseClassificationResult, STORAGE_DYNAMIC_CATEGORIES_KEY };
