// llm.test.js — LLM 模块纯函数单元测试
// 使用方式: node --experimental-vm-modules tests/llm.test.js

import { parseClassificationResult, getDefaultLLMConfig, LLM_PROVIDERS, DEFAULT_LLM_CONFIG, validateLLMConfig } from '../llm.js';

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

function assertDeepEqual(actual, expected, msg) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed++;
    process.stdout.write('  ✅ ');
  } else {
    failed++;
    process.stdout.write(`  ❌ (expected: ${JSON.stringify(expected)}, got: ${JSON.stringify(actual)}) `);
  }
  console.log(msg);
}

console.log('\n🤖 ===== LLM 模块测试 =====\n');

// ===== getDefaultLLMConfig =====
console.log('── getDefaultLLMConfig ──');

const config = getDefaultLLMConfig();
assertEqual(config.enabled, false, '默认 enabled 为 false');
assertEqual(config.provider, 'custom', '默认 provider 为 custom');
assertEqual(config.apiKey, '', '默认 apiKey 为空');
assertEqual(config.batchSize, 30, '默认 batchSize 为 30');
assertEqual(config.maxTokens, 4000, '默认 maxTokens 为 4000');
assertEqual(config.temperature, 0.3, '默认 temperature 为 0.3');
assertEqual(config.maxCategories, 10, '默认 maxCategories 为 10');
// 验证是深拷贝，修改不影响原始
config.enabled = true;
assertEqual(DEFAULT_LLM_CONFIG.enabled, false, '返回值是深拷贝');

// ===== LLM_PROVIDERS 结构 =====
console.log('\n── LLM_PROVIDERS 结构 ──');

assert('custom' in LLM_PROVIDERS, '存在 custom 提供商');
const custom = LLM_PROVIDERS.custom;
assertEqual(custom.name, '自定义 LLM', 'custom 名称正确');
assertEqual(custom.requiresAuth, true, 'custom 需要认证');
assert(typeof custom.headers === 'function', 'headers 是函数');
assert(typeof custom.buildUrl === 'function', 'buildUrl 是函数');
assert(typeof custom.buildBody === 'function', 'buildBody 是函数');
assert(typeof custom.parseResponse === 'function', 'parseResponse 是函数');

// 测试 headers 函数
const headers = custom.headers('test-key-123');
assertEqual(headers['Authorization'], 'Bearer test-key-123', 'headers 含 Bearer token');
assertEqual(headers['Content-Type'], 'application/json', 'headers 含 Content-Type');

// 测试 buildUrl
assertEqual(custom.buildUrl(null, null, { customBaseUrl: 'https://api.openai.com/v1' }), 'https://api.openai.com/v1/chat/completions', 'buildUrl 补全 /chat/completions');
assertEqual(custom.buildUrl(null, null, { customBaseUrl: 'https://api.openai.com/v1/' }), 'https://api.openai.com/v1/chat/completions', 'buildUrl 去尾部斜杠再补全');
assertEqual(custom.buildUrl(null, null, { customBaseUrl: 'https://api.openai.com/v1/chat/completions' }), 'https://api.openai.com/v1/chat/completions', 'buildUrl 已完整不重复补全');
assertEqual(custom.buildUrl(null, null, { customBaseUrl: '' }), '', '空 baseUrl → 空');

// 测试 buildBody
const body = custom.buildBody([{ role: 'user', content: 'hi' }], 'gpt-4o-mini', { temperature: 0.5, maxTokens: 2000 });
assertEqual(body.model, 'gpt-4o-mini', 'buildBody model 正确');
assertEqual(body.messages.length, 1, 'buildBody messages 长度正确');
assertEqual(body.messages[0].content, 'hi', 'buildBody 消息内容正确');
assertEqual(body.temperature, 0.5, 'buildBody temperature 使用传入值');
assertEqual(body.max_tokens, 2000, 'buildBody max_tokens 使用传入值');

// 默认值测试
const bodyDefault = custom.buildBody([], 'gpt-4', undefined);
assertEqual(bodyDefault.temperature, 0.3, 'buildBody temperature 默认 0.3');
assertEqual(bodyDefault.max_tokens, 4000, 'buildBody max_tokens 默认 4000');

// 测试 parseResponse
assertEqual(custom.parseResponse({ choices: [{ message: { content: 'hello' } }] }), 'hello', 'parseResponse 正常解析');
assertEqual(custom.parseResponse({}), '', 'parseResponse 空响应');

// ===== parseClassificationResult =====
console.log('\n── parseClassificationResult ──');

// 标准 JSON 数组
const result1 = parseClassificationResult(
  '[{"index":1,"category":"技术","reason":"开发相关"},{"index":2,"category":"教育","reason":"教程"}]',
  2
);
assert(result1 !== null, '标准 JSON 解析成功');
assertEqual(result1[1].category, '技术', '第一个元素 category 正确');
assertEqual(result1[1].reason, '开发相关', '第一个元素 reason 正确');
assertEqual(result1[2].category, '教育', '第二个元素 category 正确');

// 带 markdown 代码块标记
const result2 = parseClassificationResult(
  '```json\n[{"index":1,"category":"技术","reason":"test"}]\n```',
  1
);
assert(result2 !== null, '带 ```json 标记解析成功');
assertEqual(result2[1].category, '技术', 'markdown 标记内的内容正确');

// 带 ``` 标记（没有 json 前缀）
const result3 = parseClassificationResult(
  '```\n[{"index":1,"category":"新闻","reason":"news"}]\n```',
  1
);
assert(result3 !== null, '带 ``` 标记解析成功');
assertEqual(result3[1].category, '新闻', '纯 ``` 标记内容正确');

// 无效 JSON
const result4 = parseClassificationResult('not json', 2);
assertEqual(result4, null, '无效 JSON → null');

// 空字符串
const result5 = parseClassificationResult('', 1);
assertEqual(result5, null, '空字符串 → null');

// 非数组 JSON
const result6 = parseClassificationResult('{"key":"value"}', 1);
assertEqual(result6, null, '非数组 JSON → null');

// 带空格的 JSON 格式
const result7 = parseClassificationResult(
  '  [{"index":1,"category":"健康","reason":"health"}]  ',
  1
);
assert(result7 !== null, '带前后空格的 JSON 解析成功');
assertEqual(result7[1].category, '健康', '空格处理后内容正确');

// 多个元素
const result8 = parseClassificationResult(
  '[{"index":1,"category":"A","reason":"a"},{"index":2,"category":"B","reason":"b"},{"index":3,"category":"C","reason":"c"}]',
  3
);
assert(result8 !== null, '三个元素解析成功');
assertEqual(Object.keys(result8).length, 3, '三个元素全部解析');
assertEqual(result8[3].category, 'C', '第三个元素正确');

// ===== validateLLMConfig 纯验证路径 =====
console.log('\n── validateLLMConfig ──');

let v = await validateLLMConfig({ enabled: false });
assertEqual(v.valid, false, '未启用 → valid=false');
assert(v.message.length > 0, '未启用 → 有提示信息');

v = await validateLLMConfig({ enabled: true, apiKey: '' });
assertEqual(v.valid, false, '无 API Key → valid=false');

v = await validateLLMConfig({ enabled: true, apiKey: 'key', customBaseUrl: '' });
assertEqual(v.valid, false, '无 Base URL → valid=false');

v = await validateLLMConfig({ enabled: true, apiKey: 'key', customBaseUrl: 'url', model: '', customModel: '' });
assertEqual(v.valid, false, '无模型 → valid=false');

// ===== DEFAULT_LLM_CONFIG 结构 =====
console.log('\n── DEFAULT_LLM_CONFIG 结构 ──');

assert(typeof DEFAULT_LLM_CONFIG.batchSize === 'number', 'batchSize 为数字');
assert(typeof DEFAULT_LLM_CONFIG.temperature === 'number', 'temperature 为数字');
assert(typeof DEFAULT_LLM_CONFIG.maxTokens === 'number', 'maxTokens 为数字');
assert(typeof DEFAULT_LLM_CONFIG.maxCategories === 'number', 'maxCategories 为数字');
assert(typeof DEFAULT_LLM_CONFIG.enabled === 'boolean', 'enabled 为布尔');

console.log(`\n📊 结果: ${passed} 通过, ${failed} 失败 (共 ${passed + failed} 项)\n`);

if (failed > 0) {
  process.exit(1);
}
