// history.test.js — 浏览历史模块纯函数单元测试
// 使用方式: node --experimental-vm-modules tests/history.test.js

import { getHistoryStartTime, parseDomain, analyzeHistory, DEFAULT_HISTORY_CONFIG } from '../history.js';

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

function assertApprox(actual, expected, tolerance, msg) {
  const diff = Math.abs(actual - expected);
  const ok = diff <= tolerance;
  if (ok) {
    passed++;
    process.stdout.write('  ✅ ');
  } else {
    failed++;
    process.stdout.write(`  ❌ (expected ~${expected}, got: ${actual}, diff: ${diff} > ${tolerance}) `);
  }
  console.log(msg);
}

console.log('\n📊 ===== 历史模块测试 =====\n');

// ===== getHistoryStartTime =====
console.log('── getHistoryStartTime ──');

const now = Date.now();
const MS_IN_MONTH = 30 * 24 * 60 * 60 * 1000;

// 默认 3 个月
const t3 = getHistoryStartTime(3);
assertApprox(t3, now - 3 * MS_IN_MONTH, 3 * 24 * 60 * 60 * 1000, '3 个月前约 3 个月（允许 ±3 天）');

// 1 个月
const t1 = getHistoryStartTime(1);
assertApprox(t1, now - 1 * MS_IN_MONTH, 3 * 24 * 60 * 60 * 1000, '1 个月前约 1 个月（允许 ±3 天）');

// 12 个月
const t12 = getHistoryStartTime(12);
assertApprox(t12, now - 12 * MS_IN_MONTH, 5 * 24 * 60 * 60 * 1000, '12 个月前约 12 个月（允许 ±5 天）');

// 边界值: 0 个月 → 至少 1 个月
const t0 = getHistoryStartTime(0);
assertApprox(t0, now - 1 * MS_IN_MONTH, 3 * 24 * 60 * 60 * 1000, '0 个月 → 按 1 个月算（允许 ±3 天）');

// 边界值: 负数 → 至少 1 个月
const tNeg = getHistoryStartTime(-5);
assertApprox(tNeg, now - 1 * MS_IN_MONTH, 3 * 24 * 60 * 60 * 1000, '负数 → 按 1 个月算（允许 ±3 天）');

// 边界值: 超过 12 → 最多 12 个月
const tOver = getHistoryStartTime(24);
assertApprox(tOver, now - 12 * MS_IN_MONTH, 5 * 24 * 60 * 60 * 1000, '24 个月 → 按 12 个月算（允许 ±5 天）');

// ===== parseDomain =====
console.log('\n── parseDomain ──');

assertEqual(parseDomain('https://github.com/user/repo'), 'github.com', '标准 URL');
assertEqual(parseDomain('https://www.github.com/user/repo'), 'github.com', 'www 前缀被剥离');
assertEqual(parseDomain('https://WWW.GITHUB.COM/REPO'), 'github.com', '大写域名小写化');
assertEqual(parseDomain('https://sub.domain.example.com/page'), 'sub.domain.example.com', '子域名保留');
assertEqual(parseDomain('http://example.com:8080/path'), 'example.com', '带端口号');
assertEqual(parseDomain('example.com'), 'example.com', '纯域名');
assertEqual(parseDomain(''), '', '空字符串');
assertEqual(parseDomain('not-a-url'), 'not-a-url', '无效 URL 返回原值小写');

// ===== analyzeHistory =====
console.log('\n── analyzeHistory ──');

// 空数据
const emptyResult = analyzeHistory([]);
assertEqual(emptyResult.domains.length, 0, '空数据 → 空域名列表');
assertEqual(emptyResult.totalVisits, 0, '空数据 → totalVisits 0');
assertEqual(emptyResult.uniqueDomains, 0, '空数据 → uniqueDomains 0');
assertEqual(emptyResult.uniqueUrls, 0, '空数据 → uniqueUrls 0');

const emptyResult2 = analyzeHistory(null);
assertEqual(emptyResult2.domains.length, 0, 'null 输入 → 空域名列表');

const emptyResult3 = analyzeHistory(undefined);
assertEqual(emptyResult3.domains.length, 0, 'undefined 输入 → 空域名列表');

// 单条数据
const single = analyzeHistory([
  { url: 'https://github.com/user/repo', title: 'GitHub', visitCount: 5, lastVisitTime: 1000 }
]);
assertEqual(single.domains.length, 1, '单条数据 → 1 个域名');
assertEqual(single.domains[0].domain, 'github.com', '域名正确');
assertEqual(single.domains[0].visitCount, 5, 'visitCount 累计正确');
assertEqual(single.domains[0].lastVisit, 1000, 'lastVisit 正确');
assertEqual(single.domains[0].urlCount, 1, 'urlCount 正确');
assertEqual(single.uniqueDomains, 1, 'uniqueDomains 正确');
assertEqual(single.uniqueUrls, 1, 'uniqueUrls 正确');
assertEqual(single.totalVisits, 5, 'totalVisits 正确');

// 多条数据同一域名
const multiSame = analyzeHistory([
  { url: 'https://github.com/user/repo1', title: 'Repo1', visitCount: 3, lastVisitTime: 300 },
  { url: 'https://github.com/user/repo2', title: 'Repo2', visitCount: 2, lastVisitTime: 500 },
  { url: 'https://github.com/user/repo3', title: 'Repo3', visitCount: 1, lastVisitTime: 100 }
]);
assertEqual(multiSame.domains.length, 1, '同一域名的多条数据 → 1 个域名');
assertEqual(multiSame.domains[0].visitCount, 6, 'visitCount 累加为 3+2+1=6');
assertEqual(multiSame.domains[0].urlCount, 3, 'urlCount 为 3');
assertEqual(multiSame.domains[0].lastVisit, 500, 'lastVisit 取最大值');
assertEqual(multiSame.totalVisits, 6, 'totalVisits 为 6');
assertEqual(multiSame.uniqueUrls, 3, '3 个不同 URL');

// 多个域名
const multiDomain = analyzeHistory([
  { url: 'https://github.com/repo', title: 'Git', visitCount: 10, lastVisitTime: 1000 },
  { url: 'https://stackoverflow.com/q/1', title: 'SO', visitCount: 5, lastVisitTime: 500 },
  { url: 'https://youtube.com/watch?v=abc', title: 'YT', visitCount: 3, lastVisitTime: 200 }
]);
assertEqual(multiDomain.domains.length, 3, '3 个不同域名');
assertEqual(multiDomain.domains[0].domain, 'github.com', '按 visitCount 降序排第一');
assertEqual(multiDomain.domains[0].visitCount, 10, 'github 访问最多');
assertEqual(multiDomain.uniqueDomains, 3, '3 个独立域名');

// 缺少 visitCount 字段
const noVisitCount = analyzeHistory([
  { url: 'https://example.com/page', title: 'Page' }
]);
assertEqual(noVisitCount.domains[0].visitCount, 1, 'visitCount 缺省 → 默认 1');

// URL 包含 www
const wwwTest = analyzeHistory([
  { url: 'https://www.github.com/repo', title: 'Git', visitCount: 5, lastVisitTime: 100 },
  { url: 'https://github.com/other', title: 'Other', visitCount: 3, lastVisitTime: 200 }
]);
assertEqual(wwwTest.domains.length, 1, 'www.github.com 和 github.com 合并为同一域名');
assertEqual(wwwTest.domains[0].visitCount, 8, '合并后 visitCount 为 5+3=8');

// sampleUrl 取最后一条
const sampleTest = analyzeHistory([
  { url: 'https://github.com/first', title: 'First', visitCount: 1, lastVisitTime: 100 },
  { url: 'https://github.com/second', title: 'Second', visitCount: 1, lastVisitTime: 200 }
]);
assertEqual(sampleTest.domains[0].sampleUrl, 'https://github.com/second', 'sampleUrl 取最后访问的');

// ===== DEFAULT_HISTORY_CONFIG 结构 =====
console.log('\n── DEFAULT_HISTORY_CONFIG 结构 ──');

assert(typeof DEFAULT_HISTORY_CONFIG.historyMonths === 'number', 'historyMonths 为数字');
assert(typeof DEFAULT_HISTORY_CONFIG.topSitesCount === 'number', 'topSitesCount 为数字');
assert(typeof DEFAULT_HISTORY_CONFIG.includeHistoryInAnalysis === 'boolean', 'includeHistoryInAnalysis 为布尔');
assert(DEFAULT_HISTORY_CONFIG.historyMonths >= 1 && DEFAULT_HISTORY_CONFIG.historyMonths <= 12, 'historyMonths 范围 1-12');

console.log(`\n📊 结果: ${passed} 通过, ${failed} 失败 (共 ${passed + failed} 项)\n`);

if (failed > 0) {
  process.exit(1);
}
