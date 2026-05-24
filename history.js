// 浏览历史分析模块

const DEFAULT_HISTORY_CONFIG = {
  historyMonths: 3,
  topSitesCount: 20,
  includeHistoryInAnalysis: true
};

function getHistoryStartTime(months) {
  const now = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - Math.max(1, Math.min(12, months)));
  return start.getTime();
}

async function queryHistory(months = 3) {
  const startTime = getHistoryStartTime(months);
  const endTime = Date.now();

  try {
    return await chrome.history.search({
      text: '',
      startTime,
      endTime,
      maxResults: 10000
    });
  } catch (e) {
    console.error('查询历史记录失败:', e);
    return [];
  }
}

function parseDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch (e) {
    return url.toLowerCase();
  }
}

function analyzeHistory(items) {
  if (!items || items.length === 0) {
    return { domains: [], categories: [], totalVisits: 0, uniqueDomains: 0, uniqueUrls: 0, rawCount: 0 };
  }

  const domainStats = {};
  const urlStats = {};

  for (const item of items) {
    const domain = parseDomain(item.url);
    if (!domainStats[domain]) {
      domainStats[domain] = {
        domain,
        visitCount: 0,
        lastVisit: 0,
        title: item.title || '',
        sampleUrl: item.url,
        urls: new Set()
      };
    }
    domainStats[domain].visitCount += (item.visitCount || 1);
    domainStats[domain].urls.add(item.url);
    if (item.lastVisitTime > domainStats[domain].lastVisit) {
      domainStats[domain].lastVisit = item.lastVisitTime;
      domainStats[domain].title = item.title || domainStats[domain].title;
      domainStats[domain].sampleUrl = item.url;
    }
    urlStats[item.url] = (urlStats[item.url] || 0) + (item.visitCount || 1);
  }

  const domainList = Object.values(domainStats)
    .map(d => ({ ...d, urlCount: d.urls.size }))
    .sort((a, b) => b.visitCount - a.visitCount);

  const totalVisits = domainList.reduce((sum, d) => sum + d.visitCount, 0);

  return {
    domains: domainList,
    totalVisits,
    uniqueDomains: domainList.length,
    uniqueUrls: Object.keys(urlStats).length,
    rawCount: items.length
  };
}

async function getTopSitesByHistory(months = 3, limit = 20) {
  const items = await queryHistory(months);
  const { domains } = analyzeHistory(items);
  return domains.slice(0, limit);
}

async function getHistorySummary(months = 3) {
  const items = await queryHistory(months);
  const analysis = analyzeHistory(items);

  const topSites = analysis.domains.slice(0, 10).map(d => ({
    domain: d.domain,
    title: d.title,
    visits: d.visitCount,
    urlCount: d.urlCount,
    lastVisit: d.lastVisit,
    sampleUrl: d.sampleUrl
  }));

  return {
    topSites,
    totalVisits: analysis.totalVisits,
    uniqueDomains: analysis.uniqueDomains,
    uniqueUrls: analysis.uniqueUrls,
    periodMonths: months
  };
}

async function mergeHistoryWeight(bookmarks, months = 3) {
  try {
    const items = await queryHistory(months);
    const domainVisitMap = {};

    for (const item of items) {
      const domain = parseDomain(item.url);
      domainVisitMap[domain] = (domainVisitMap[domain] || 0) + (item.visitCount || 1);
    }

    const maxVisits = Math.max(...Object.values(domainVisitMap), 1);

    return bookmarks.map(bm => {
      let hostname = '';
      try { hostname = new URL(bm.url).hostname.replace(/^www\./, '').toLowerCase(); } catch (e) {}

      const visits = domainVisitMap[hostname] || 0;
      const weight = Math.min(visits / maxVisits * 10, 10);

      return {
        ...bm,
        historyWeight: weight,
        visitCount: visits
      };
    });
  } catch (e) {
    return bookmarks.map(bm => ({ ...bm, historyWeight: 0, visitCount: 0 }));
  }
}

async function getHistoryConfig() {
  const stored = await chrome.storage.sync.get('abookmark_history_config');
  return { ...DEFAULT_HISTORY_CONFIG, ...(stored.abookmark_history_config || {}) };
}

export { DEFAULT_HISTORY_CONFIG, queryHistory, analyzeHistory, getTopSitesByHistory, getHistorySummary, mergeHistoryWeight, getHistoryConfig, getHistoryStartTime, parseDomain };
