// test_real_bookmarks.js — 使用真实书签导出文件验证分类器
// 使用方式: node --experimental-vm-modules tests/test_real_bookmarks.js

import { classifyBookmarkFast, CATEGORIES } from '../classifier.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(__dirname, 'test_bookmark.html'), 'utf-8');

// 解析 Netscape 书签格式，提取所有 <A HREF="...">title</A>
function parseBookmarks(html) {
  const bookmarks = [];
  const regex = /<DT><A\s+HREF="([^"]*)"[^>]*>([^<]*)<\/A>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const url = match[1].trim();
    const title = match[2].trim();
    if (url && !url.startsWith('edge://') && !url.startsWith('file://') && !url.startsWith('place:')) {
      bookmarks.push({ url, title });
    }
  }
  return bookmarks;
}

// 解析文件夹结构，获取每个书签的文件夹路径
function parseFolderContext(html) {
  const folderMap = {}; // url -> folderPath
  const folderStack = [];
  const lines = html.split('\n');

  for (const line of lines) {
    // 进入文件夹
    const h3Match = line.match(/<DT><H3[^>]*>([^<]*)<\/H3>/);
    if (h3Match && line.includes('<DL>')) {
      folderStack.push(h3Match[1].trim());
    }
    // 书签行
    const aMatch = line.match(/<DT><A\s+HREF="([^"]*)"[^>]*>([^<]*)<\/A>/);
    if (aMatch) {
      const url = aMatch[1].trim();
      if (folderStack.length > 0) {
        folderMap[url] = folderStack.join(' / ');
      }
    }
    // 退出文件夹
    if (line.includes('</DL>') && folderStack.length > 0) {
      folderStack.pop();
    }
  }
  return folderMap;
}

const bookmarks = parseBookmarks(html);
const folderContext = parseFolderContext(html);

console.log(`\n📚 ===== 真实书签分类测试 =====`);
console.log(`总书签数: ${bookmarks.length}\n`);

// 分类所有书签
const results = [];
const categoryStats = {};
const confidenceStats = { high: 0, medium: 0, low: 0 };
const folderOriginStats = {};

for (const bm of bookmarks) {
  const result = classifyBookmarkFast(bm.url, bm.title);
  const folder = folderContext[bm.url] || '根目录';

  results.push({
    url: bm.url,
    title: bm.title,
    category: result.category,
    confidence: result.confidence,
    score: result.score,
    folder
  });

  // 统计
  categoryStats[result.category] = (categoryStats[result.category] || 0) + 1;
  confidenceStats[result.confidence] = (confidenceStats[result.confidence] || 0) + 1;

  // 按原始文件夹统计
  if (!folderOriginStats[folder]) {
    folderOriginStats[folder] = {};
  }
  folderOriginStats[folder][result.category] = (folderOriginStats[folder][result.category] || 0) + 1;
}

// ==== 报告 1: 分类分布 ====
console.log('── 1. 分类分布 ──');
const sortedCats = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);
for (const [cat, count] of sortedCats) {
  const pct = ((count / bookmarks.length) * 100).toFixed(1);
  const bar = '█'.repeat(Math.round(count / bookmarks.length * 50));
  console.log(`  ${cat.padEnd(14)} ${String(count).padStart(3)} (${pct}%) ${bar}`);
}

// ==== 报告 2: 置信度分布 ====
console.log('\n── 2. 置信度分布 ──');
for (const [level, count] of Object.entries(confidenceStats)) {
  const pct = ((count / bookmarks.length) * 100).toFixed(1);
  const label = level === 'high' ? '高' : level === 'medium' ? '中' : '低';
  console.log(`  ${label} (${level.padEnd(6)}): ${count} (${pct}%)`);
}

// ==== 报告 3: 按原始文件夹分类 ====
console.log('\n── 3. 原始文件夹 → 分类映射（前 15 个文件夹）──');
const sortedFolders = Object.entries(folderOriginStats)
  .sort((a, b) => {
    const totalA = Object.values(a[1]).reduce((s, v) => s + v, 0);
    const totalB = Object.values(b[1]).reduce((s, v) => s + v, 0);
    return totalB - totalA;
  })
  .slice(0, 15);

for (const [folder, cats] of sortedFolders) {
  const topCats = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const total = Object.values(cats).reduce((s, v) => s + v, 0);
  const catStr = topCats.map(([c, n]) => `${c}(${n})`).join(', ');
  console.log(`  📁 ${folder.padEnd(30)} → ${catStr} [${total}个]`);
}

// ==== 报告 4: 样本抽查 ====
console.log('\n── 4. 样本抽查（每分类前 3 个）──');
const catSamples = {};
for (const r of results) {
  if (!catSamples[r.category]) catSamples[r.category] = [];
  if (catSamples[r.category].length < 3) catSamples[r.category].push(r);
}

for (const [cat, samples] of Object.entries(catSamples).sort((a, b) => (categoryStats[b[0]] || 0) - (categoryStats[a[0]] || 0))) {
  console.log(`\n  【${cat}】(${categoryStats[cat]} 个)`);
  for (const s of samples) {
    const title = s.title.length > 50 ? s.title.slice(0, 47) + '...' : s.title;
    const conf = s.confidence === 'high' ? '🟢' : s.confidence === 'medium' ? '🟡' : '🔴';
    console.log(`    ${conf} ${title}`);
  }
}

// ==== 报告 5: 已知/未知分类 ====
console.log('\n── 5. 已知分类 vs 新分类 ──');
const knownCats = new Set(Object.keys(CATEGORIES));
let knownCount = 0;
let unknownCount = 0;
const unknownCats = {};
for (const r of results) {
  if (knownCats.has(r.category)) {
    knownCount++;
  } else {
    unknownCount++;
    unknownCats[r.category] = (unknownCats[r.category] || 0) + 1;
  }
}
console.log(`  已知分类: ${knownCount} (${((knownCount / bookmarks.length) * 100).toFixed(1)}%)`);
console.log(`  域名兜底: ${unknownCount} (${((unknownCount / bookmarks.length) * 100).toFixed(1)}%)`);

if (Object.keys(unknownCats).length > 0) {
  const topUnknown = Object.entries(unknownCats).sort((a, b) => b[1] - a[1]).slice(0, 10);
  console.log(`  常见域名兜底分类:`);
  for (const [cat, count] of topUnknown) {
    console.log(`    ${cat}: ${count} 个`);
  }
}

// ==== 报告 6: 低置信度样本 ====
console.log('\n── 6. 低置信度书签（需关注）──');
const lowConfResults = results.filter(r => r.confidence === 'low');
console.log(`  共 ${lowConfResults.length} 个低置信度书签`);
for (const r of lowConfResults.slice(0, 10)) {
  const title = r.title.length > 60 ? r.title.slice(0, 57) + '...' : r.title;
  console.log(`    🔴 ${title}`);
  console.log(`       分类: ${r.category} | 原始: ${r.folder}`);
}
if (lowConfResults.length > 10) {
  console.log(`    ... 及其他 ${lowConfResults.length - 10} 个`);
}

console.log(`\n📊 完成！共分析 ${bookmarks.length} 个书签\n`);
