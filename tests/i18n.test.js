// i18n.test.js — 国际化模块单元测试
// 使用方式: node --experimental-vm-modules tests/i18n.test.js

import { t, getRegion, setLang } from '../i18n.js';

// Ensure English mode for deterministic test results
await setLang('en');

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

console.log('\n🌐 ===== i18n 模块测试 =====\n');

// ===== t() 基本翻译 =====
console.log('── t() 基本翻译 ──');

// 由于 detectLang 依赖 navigator.language，在 Node 环境下默认走 en
// 所以 t() 默认返回英文
assertEqual(t('appName'), 'AlphaMark', 'appName 英文默认值');

// ===== t() 参数替换 =====
console.log('\n── t() 参数替换 ──');

assertEqual(t('bookmarkCount', { count: 42 }), '42 bookmarks', 'bookmarkCount 数字替换');
assertEqual(t('previewCount', { count: 10 }), '10 bookmarks', 'previewCount 数字替换');
assertEqual(t('visitsCount', { count: 999 }), '999 visits', 'visitsCount 数字替换');

// ===== t() 边界情况 =====
console.log('\n── t() 边界情况 ──');

// 不存在的 key → 返回 key 本身
assertEqual(t('nonexistent_key_xyz'), 'nonexistent_key_xyz', '不存在 key → 返回 key');

// 空参数
assertEqual(t('appName', {}), 'AlphaMark', '空参数不影响');
assertEqual(t('appName', { unrelated: 'x' }), 'AlphaMark', '无关参数不影响');

// 数字为 0 的替换
assertEqual(t('previewCount', { count: 0 }), '0 bookmarks', 'count=0 替换');

// ===== getRegion() =====
console.log('\n── getRegion() ──');

// 在 Node 环境下，navigator.language 通常是 en-US 或类似
const region = getRegion();
assert(typeof region === 'string', 'getRegion 返回字符串');
assert(region === 'cn' || region === 'intl', 'getRegion 返回 cn 或 intl');

// ===== 带多参数的翻译 =====
console.log('\n── 复合参数 ──');

assertEqual(t('progressKeyword', { processed: 5, total: 10 }), 'Keyword classify 5/10', '复合参数替换');

console.log(`\n📊 结果: ${passed} 通过, ${failed} 失败 (共 ${passed + failed} 项)\n`);

if (failed > 0) {
  process.exit(1);
}
