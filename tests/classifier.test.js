// classifier.test.js — 关键词分类引擎单元测试
// 使用方式: node --experimental-vm-modules tests/classifier.test.js

import { classifyBookmark, classifyBookmarkFast, extractPageText, normalizeText, domainToCategory, classifyByDomain, scoreByKeywords, getClassifyCacheKey, CATEGORIES, CATEGORY_NAMES_EN, DEFAULT_CONFIG } from '../classifier.js';

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

function assertContains(actual, expected, msg) {
  const ok = actual.includes ? actual.includes(expected) : expected.includes(actual);
  if (ok) {
    passed++;
    process.stdout.write('  ✅ ');
  } else {
    failed++;
    process.stdout.write(`  ❌ (expected contains: ${expected}, actual: ${actual}) `);
  }
  console.log(msg);
}

function assertNotEqual(actual, expected, msg) {
  const ok = actual !== expected;
  if (ok) {
    passed++;
    process.stdout.write('  ✅ ');
  } else {
    failed++;
    process.stdout.write(`  ❌ (expected not: ${JSON.stringify(expected)}, got: ${JSON.stringify(actual)}) `);
  }
  console.log(msg);
}

console.log('\n📚 ===== 分类引擎测试 =====\n');

// ===== 域名精确匹配 =====
console.log('── 域名精确匹配 ──');

let r;
r = classifyBookmarkFast('https://github.com/opencode-ai', 'OpenCode GitHub');
assertEqual(r.category, '技术与编程', 'github.com → 技术与编程');
assertEqual(r.confidence, 'high', 'github.com → 置信度 high');

r = classifyBookmarkFast('https://twitter.com/elonmusk', 'Elon Musk');
assertEqual(r.category, '社交与通讯', 'twitter.com → 社交与通讯');
assertEqual(r.confidence, 'high', 'twitter.com → 置信度 high');

r = classifyBookmarkFast('https://www.youtube.com/watch?v=xxx', 'Video');
assertEqual(r.category, '娱乐与视频', 'youtube.com → 娱乐与视频');

r = classifyBookmarkFast('https://stackoverflow.com/questions/1', 'Question');
assertEqual(r.category, '技术与编程', 'stackoverflow.com → 技术与编程');

r = classifyBookmarkFast('https://www.amazon.com/dp/xxx', 'Product');
assertEqual(r.category, '购物与电商', 'amazon.com → 购物与电商');

r = classifyBookmarkFast('https://www.coursera.org/learn/python', 'Python Course');
assertEqual(r.category, '教育学习', 'coursera.org → 教育学习');

r = classifyBookmarkFast('https://www.airbnb.com/rooms/123', 'Room');
assertEqual(r.category, '旅游出行', 'airbnb.com → 旅游出行');

// ===== 关键词打分 =====
console.log('\n── 关键词打分 ──');

r = classifyBookmarkFast('https://example.com/article/learn-python-beginners', 'Learn Python for Beginners Tutorial');
// "tutorial"=3 在"技术与编程", "learn"=2 在"教育学习"
// 随着 32 类扩充，匹配路径可能发生变化，确保不是"未分类"
assert(["技术与编程", "教育学习"].includes(r.category), '有匹配关键词 → 不会是未分类');
assertEqual(r.confidence, 'low', '分数 3 < 8 → 置信度 low');

r = classifyBookmarkFast('https://example.com/news/breaking-stock-market', 'Stock Market News Today');
assertEqual(r.category, '新闻与资讯', '"news" + "stock" → 新闻与资讯优先');

r = classifyBookmarkFast('https://random-site.com/page', 'Some Random Page');
assertEqual(r.category, 'Random-site', '无匹配关键词 → 域名兜底');
assertEqual(r.confidence, 'low', '无匹配 → 置信度 low');

// ===== 网页文本提取 =====
console.log('\n── 网页文本提取 ──');

const html = `<!DOCTYPE html>
<html><head>
<title>My Recipe Blog - How to Cook Pasta</title>
<meta name="description" content="Learn how to cook perfect pasta every time">
<meta name="keywords" content="pasta, cooking, recipe, italian">
<meta property="og:title" content="Perfect Pasta Recipe">
<meta property="og:description" content="Step by step pasta cooking guide">
</head><body><h1>Pasta Recipe</h1></body></html>`;

const text = extractPageText(html, 'https://example.com/pasta');
assertContains(text, 'How to Cook Pasta', '提取 title');
assertContains(text, 'perfect pasta', '提取 meta description');
assertContains(text, 'cooking', '提取 keywords');
assertContains(text, 'Perfect Pasta Recipe', '提取 og:title');

// ===== LLM 分级场景测试 =====
console.log('\n── 置信度分级 ──');

r = classifyBookmarkFast('https://docs.docker.com/compose/', 'Docker Compose Documentation');
assert(r.confidence !== 'low', '知名技术站点不应为 low');

r = classifyBookmarkFast('https://unknown1234567890.com/x/y/z', 'A B C D E F G H I J');
assertEqual(r.confidence, 'low', '完全无匹配 → low');

// ===== 多语言关键词 =====
console.log('\n── 中文关键词 ──');

r = classifyBookmarkFast('https://www.bilibili.com/video/BV1xx', 'B站视频');
assertEqual(r.category, '社交与通讯', 'bilibili.com → 社交与通讯');

r = classifyBookmarkFast('https://www.jd.com/product/123', '京东商品');
assertEqual(r.category, '购物与电商', 'jd.com → 购物与电商');

r = classifyBookmarkFast('https://juejin.cn/post/123', '掘金文章');
assertEqual(r.category, '技术与编程', 'juejin.cn → 技术与编程');

// ===== 中文网站名称关键词 =====
console.log('\n── 中文网站名称 ──');

r = classifyBookmarkFast('https://weibo.com/u/123', '微博');
assertEqual(r.category, '社交与通讯', '微博 → 社交与通讯');
assertEqual(r.confidence, 'high', '微博 → high');

r = classifyBookmarkFast('https://www.douyin.com/video/123', '抖音短视频');
assertEqual(r.category, '社交与通讯', 'douyin.com + 抖音 → 社交与通讯');

r = classifyBookmarkFast('https://www.xiaohongshu.com/explore/123', '小红书笔记');
assertEqual(r.category, '社交与通讯', 'xiaohongshu → 社交与通讯');

r = classifyBookmarkFast('https://www.douban.com/group/123', '豆瓣小组');
assertEqual(r.category, '社交与通讯', '豆瓣 → 社交与通讯');

r = classifyBookmarkFast('https://taobao.com/item/123', '淘宝商品');
assertEqual(r.category, '购物与电商', '淘宝 → 购物与电商');

r = classifyBookmarkFast('https://pinduoduo.com/goods/123', '拼多多优惠');
assertEqual(r.category, '购物与电商', '拼多多 → 购物与电商');

r = classifyBookmarkFast('https://www.iqiyi.com/video/123', '爱奇艺视频');
assertEqual(r.category, '娱乐与视频', '爱奇艺 → 娱乐与视频');

r = classifyBookmarkFast('https://gitee.com/project/123', 'Gitee代码仓库');
assertEqual(r.category, '技术与编程', 'Gitee → 技术与编程');

r = classifyBookmarkFast('https://www.feishu.cn/doc/123', '飞书文档');
assertEqual(r.category, '效率工具', '飞书 → 效率工具');

r = classifyBookmarkFast('https://www.dingtalk.com/', '钉钉工作台');
assertEqual(r.category, '效率工具', '钉钉 → 效率工具');

r = classifyBookmarkFast('https://www.toutiao.com/article/123', '今日头条新闻');
assertEqual(r.category, '新闻与资讯', '今日头条 → 新闻与资讯');

r = classifyBookmarkFast('https://www.ctrip.com/hotel/123', '携程酒店');
assertEqual(r.category, '旅游出行', '携程 → 旅游出行');

r = classifyBookmarkFast('https://waimai.meituan.com/', '美团外卖');
assertEqual(r.category, '美食烹饪', '美团 → 美食烹饪');

r = classifyBookmarkFast('https://www.zcool.com.cn/work/123', '站酷设计作品');
assert(r.category === '设计与创意', '站酷 → 设计与创意');

// ===== 边界情况 =====
console.log('\n── 边界情况 ──');

r = classifyBookmarkFast('', '');
assertEqual(r.category, '网页', '空 URL / 空标题 → 网页');

r = classifyBookmarkFast('not-a-valid-url', 'test');
assert(r.confidence !== 'high', '无效 URL → 正确处理');

r = classifyBookmarkFast('https://verylongdomainnamethatdoesnotexistinanycategory.com/page', 'x');
assert(r.confidence === 'low' || r.confidence === 'medium', '无匹配长域名 → low 或 medium');

// ===== 多类别竞争 =====
console.log('\n── 多类别竞争 ──');

r = classifyBookmarkFast('https://medium.com/@user/learn-react', 'Learn React - Medium Article');
assert(['技术与编程', '新闻与资讯', '阅读与写作'].includes(r.category), 'medium 技术文章 → 技术编程/新闻/阅读');

// ===== 新增: normalizeText 直接测试 =====
console.log('\n── normalizeText ──');

assertEqual(normalizeText(''), '', '空字符串 → 空');
assertEqual(normalizeText(null), '', 'null → 空');
assertEqual(normalizeText(undefined), '', 'undefined → 空');
assertEqual(normalizeText('Hello World'), 'hello world', '英文小写化');
assertEqual(normalizeText('Hello!@#$World'), 'hello @  world', '`@` 被保留, 其他特殊字符转为空格');
assertEqual(normalizeText('学习编程'), '学习编程', '中文保持不变');
assertEqual(normalizeText('Hello世界'), 'hello世界', '中英混合');
assertEqual(normalizeText('github.com'), 'github.com', '点号被保留（分类器允许域名中的点号）');
assertEqual(normalizeText('  spaces  '), '  spaces  ', '多余空格保留');  // normalizeText doesn't trim

// ===== 新增: domainToCategory 直接测试 =====
console.log('\n── domainToCategory ──');

assertEqual(domainToCategory(''), '网页', '空字符串 → 网页');
assertEqual(domainToCategory(null), '网页', 'null → 网页');
assertEqual(domainToCategory('github.com'), 'Github', '标准域名');
assertEqual(domainToCategory('www.github.com'), 'Github', 'www 前缀被剥离');
assertEqual(domainToCategory('www2.github.com'), 'Github', 'www2 前缀被剥离');
assertEqual(domainToCategory('stackoverflow.com'), 'Stackoverflow', '复合域名取首段');
assertEqual(domainToCategory('192.168.1.1'), '192', 'IP 地址取首段');
assertEqual(domainToCategory('中文.com'), '中文', '中文域名');

// ===== 新增: getClassifyCacheKey 直接测试 =====
console.log('\n── getClassifyCacheKey ──');

assertEqual(getClassifyCacheKey('https://example.com', 'Title'), 'https://example.com|Title', '标准 URL+标题');
assertEqual(getClassifyCacheKey('https://example.com', ''), 'https://example.com|', '空标题');
assertEqual(getClassifyCacheKey('https://example.com', null), 'https://example.com|', 'null 标题 → 空字符串替代');

// ===== 新增: classifyBookmark 含网页内容 =====
console.log('\n── classifyBookmark 含 pageText ──');

r = classifyBookmark('https://unknown-example.com/recipe/pasta', 'Best Pasta Recipe', 'pasta cooking recipe italian food');
assertEqual(r.category, '美食烹饪', 'pageText 含 "recipe"+"cooking" → 美食烹饪');
assert(r.score > 0, '有正分数');

r = classifyBookmark('https://unknown-example.com/learn/math', 'Math Course', 'online learning education course tutorial');
assertEqual(r.category, '教育学习', 'pageText 含 "learning"+"education"+"course" → 教育学习');

// ===== 新增: classifyByDomain 直接测试 =====
console.log('\n── classifyByDomain 直接测试 ──');

r = classifyByDomain('github.com');
assertNotEqual(r, null, 'github.com → 有结果');
assertEqual(r.category, '技术与编程', 'github.com 命中 domain');

r = classifyByDomain('youtube.com');
assertNotEqual(r, null, 'youtube.com → 有结果');
assertEqual(r.category, '娱乐与视频', 'youtube.com 命中 domain');

r = classifyByDomain('unknown-domain-xyz.com');
assertEqual(r, null, '未知域名 → null');

r = classifyByDomain('');
assertEqual(r, null, '空字符串 → null');

// ===== 新增: scoreByKeywords 直接测试 =====
console.log('\n── scoreByKeywords 直接测试 ──');

let scores = scoreByKeywords('learn python tutorial', 'example.com');
assert(Object.keys(scores).length > 0, '有关键词匹配');
// "tutorial"=3 在"技术与编程", "learn"=2 在"教育学习"
assert(scores['技术与编程'] >= 3, '技术和编程得分正确');
assert(scores['教育学习'] >= 2, '教育学习得分正确');

scores = scoreByKeywords('', '');
assertEqual(Object.keys(scores).length, 0, '空输入 → 空结果');

scores = scoreByKeywords('xyzabc', 'unknown.com');
assertEqual(Object.keys(scores).length, 0, '无匹配关键词 → 空结果');

// ===== 新增: .gov 和 .gov.cn 域名匹配 =====
console.log('\n── 政府与参考域名 ──');

r = classifyBookmarkFast('https://www.gov.cn/policy/123', '政策文件');
assertEqual(r.category, '政府与参考', 'gov.cn → 政府与参考');

r = classifyBookmarkFast('https://www.nih.gov/research', 'NIH Research');
assertEqual(r.category, '政府与参考', 'nih.gov → 政府与参考');

// ===== 新增: 分类结果属性完整性 =====
console.log('\n── 结果属性完整性 ──');

r = classifyBookmarkFast('https://github.com/user/repo', 'My Project');
assert(r.category !== undefined, '结果包含 category');
assert(r.confidence !== undefined, '结果包含 confidence');
assert(typeof r.score === 'number', 'score 是数字');
assert(['high', 'medium', 'low'].includes(r.confidence), 'confidence 取值正确');
assert(r.scores === undefined || typeof r.scores === 'object', 'scores 可选对象');

// ===== 新增: 边界 URL 格式 =====
console.log('\n── 边界 URL 格式 ──');

r = classifyBookmarkFast('https://GITHUB.COM/User/Repo', 'Case Test');
assertEqual(r.category, '技术与编程', '大写域名不区分大小写');

r = classifyBookmarkFast('https://github.com:8443/path?q=1#hash', 'Port Test');
assertEqual(r.category, '技术与编程', '带端口号的 URL');

r = classifyBookmarkFast('https://stackoverflow.com/questions/123/如何编程', '中文 path');
assertEqual(r.category, '技术与编程', '带中文 path 的 URL');

// ===== 新增: LLM 分级阈值更精确 =====
console.log('\n── 置信度阈值 ──');

// 一个高权重关键词的域名 match 得到 score >= 8 应该是 high
r = classifyBookmarkFast('https://github.com/org/repo', 'GitHub Repo');
assertEqual(r.confidence, 'high', '域名精确匹配 → high');

// 无匹配域名但通用关键词只有低权重 → low
r = classifyBookmarkFast('https://random1234xyz.com/shop/item', 'Shop Item');
// "shop"=3 → score 3 → < 8 → low
assertEqual(r.confidence, 'low', '低分关键词 → low');

// ===== CATEGORIES 数据结构验证 =====
console.log('\n── CATEGORIES 数据结构 ──');

const catKeys = Object.keys(CATEGORIES);
assertEqual(catKeys.length, 32, '32 个内置分类');
for (const cat of catKeys) {
  const kw = CATEGORIES[cat].keywords;
  assert(Array.isArray(kw) && kw.length > 0, `${cat} 有关键词列表`);
  for (const entry of kw) {
    assert(typeof entry.word === 'string' && entry.word.length > 0, `${cat} 关键词 word 非空字符串`);
    assert(typeof entry.weight === 'number' && entry.weight >= 1 && entry.weight <= 10, `${cat} 关键词 weight 1-10`);
  }
}

// ===== CATEGORY_NAMES_EN 完整性 =====
console.log('\n── CATEGORY_NAMES_EN 完整性 ──');

for (const cat of catKeys) {
  assert(CATEGORY_NAMES_EN[cat] !== undefined, `${cat} 有英文映射`);
  assert(typeof CATEGORY_NAMES_EN[cat] === 'string', `${cat} 的英文映射为字符串`);
}
assertEqual(Object.keys(CATEGORY_NAMES_EN).length, catKeys.length, '英文映射数量与分类数量一致');

// ===== DEFAULT_CONFIG 结构 =====
console.log('\n── DEFAULT_CONFIG 结构 ──');

assert(typeof DEFAULT_CONFIG.confidenceThreshold === 'number', 'confidenceThreshold 为数字');
assert(typeof DEFAULT_CONFIG.maxConcurrentFetches === 'number', 'maxConcurrentFetches 为数字');
assert(typeof DEFAULT_CONFIG.fetchTimeout === 'number', 'fetchTimeout 为数字');
assert(typeof DEFAULT_CONFIG.fetchPageContent === 'boolean', 'fetchPageContent 为布尔');
assert(typeof DEFAULT_CONFIG.autoOrganizeOnBookmark === 'boolean', 'autoOrganizeOnBookmark 为布尔');

// ===== 总结 =====
console.log(`\n📊 结果: ${passed} 通过, ${failed} 失败 (共 ${passed + failed} 项)\n`);

if (failed > 0) {
  process.exit(1);
}
