const STORAGE_KEY = "searchHistoryRecords";
const MAX_RECORDS = 1000;
const DEDUPE_WINDOW_MS = 2 * 60 * 1000;
const SEARCH_PARAM_KEYS = [
  "q",
  "query",
  "keyword",
  "k",
  "search",
  "wd",
  "word",
  "text",
  "p"
];

const CATEGORY_RULES = [
  {
    name: "学习",
    keywords: ["课程", "教程", "学习", "论文", "作业", "题库", "考试", "python", "数学"],
    domains: ["bilibili.com", "zhihu.com", "scholar.google", "arxiv.org", "coursera.org", "edx.org"],
    urlIncludes: ["moodle", ".edu", "edu.cn", "university", "course"]
  },
  {
    name: "购物",
    keywords: ["购买", "价格", "优惠", "折扣", "京东", "淘宝", "拼多多", "耳机", "手机"],
    domains: ["taobao.com", "jd.com", "tmall.com", "pinduoduo.com", "amazon."],
    urlIncludes: ["taobao", "tmall", "jd.", "pinduoduo", "shop", "product"]
  },
  {
    name: "工作",
    keywords: ["招聘", "简历", "面试", "ppt", "方案", "需求", "jira", "notion", "飞书"],
    domains: ["linkedin.com", "bosszhipin.com", "zhipin.com", "lagou.com", "feishu.cn"],
    urlIncludes: ["careers", "job", "resume", "interview", "workspace"]
  },
  {
    name: "娱乐",
    keywords: ["电影", "音乐", "综艺", "游戏", "直播", "动漫", "小说"],
    domains: ["douyin.com", "iqiyi.com", "youku.com", "qq.com", "weibo.com", "xiaohongshu.com"],
    urlIncludes: ["video", "music", "game", "live", "entertainment"]
  },
  {
    name: "生活",
    keywords: ["天气", "旅游", "美食", "酒店", "地图", "地铁", "健康", "运动"],
    domains: ["ctrip.com", "qunar.com", "meituan.com", "amap.com", "dianping.com"],
    urlIncludes: ["travel", "hotel", "food", "map", "weather", "health"]
  }
];
const TOPIC_ALIAS_RULES = [
  { topic: "AI", patterns: ["ai", "gpt", "llm", "机器学习", "深度学习", "人工智能"] },
  { topic: "编程", patterns: ["python", "javascript", "java", "代码", "算法", "编程", "开发"] },
  { topic: "求职", patterns: ["简历", "面试", "招聘", "校招", "实习", "offer"] },
  { topic: "电商", patterns: ["淘宝", "京东", "拼多多", "价格", "优惠", "折扣", "购买"] },
  { topic: "数码", patterns: ["手机", "耳机", "电脑", "显卡", "ipad", "iphone"] },
  { topic: "学习", patterns: ["课程", "教程", "作业", "考试", "论文", "题库"] },
  { topic: "出行", patterns: ["机票", "高铁", "酒店", "旅游", "地图", "路线"] },
  { topic: "美食", patterns: ["美食", "餐厅", "外卖", "火锅", "咖啡", "奶茶"] },
  { topic: "娱乐", patterns: ["电影", "音乐", "综艺", "游戏", "动漫", "小说"] }
];
const SCREENSHOT_SEARCH_URLS = {
  text: "https://www.google.com/search?q={keyword}",
  video: "https://www.youtube.com/results?search_query={keyword}",
  image: "https://www.google.com/search?tbm=isch&q={keyword}",
  product: "https://s.taobao.com/search?q={keyword}"
};

function parseSearchKeyword(rawUrl) {
  try {
    const url = new URL(rawUrl);

    for (const key of SEARCH_PARAM_KEYS) {
      const value = url.searchParams.get(key);
      if (value && value.trim()) {
        return value.trim();
      }
    }

    // Some websites keep keywords in hash fragments: #q=something
    if (url.hash.includes("=")) {
      const hash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
      const hashParams = new URLSearchParams(hash);
      for (const key of SEARCH_PARAM_KEYS) {
        const value = hashParams.get(key);
        if (value && value.trim()) {
          return value.trim();
        }
      }
    }
  } catch (_error) {
    return "";
  }

  return "";
}

function normalizeKeyword(keyword) {
  return String(keyword || "")
    .trim()
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalizeUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return `${url.hostname}${url.pathname}`.toLowerCase();
  } catch (_error) {
    return String(rawUrl || "").toLowerCase();
  }
}

function detectSource(rawUrl) {
  let host = "";
  try {
    host = new URL(rawUrl || "").hostname.toLowerCase();
  } catch (_error) {
    return "未知来源";
  }

  const sourceMap = [
    { name: "Google", includes: ["google."] },
    { name: "百度", includes: ["baidu.com"] },
    { name: "必应", includes: ["bing.com"] },
    { name: "知乎", includes: ["zhihu.com"] },
    { name: "小红书", includes: ["xiaohongshu.com"] },
    { name: "淘宝", includes: ["taobao.com", "tmall.com"] },
    { name: "京东", includes: ["jd.com"] },
    { name: "Moodle", includes: ["moodle"] }
  ];

  for (const item of sourceMap) {
    if (item.includes.some((part) => host.includes(part))) {
      return item.name;
    }
  }
  return host.replace(/^www\./, "");
}

function detectCategory(rawUrl, keyword) {
  const text = `${keyword || ""}`.toLowerCase();
  const fullUrl = String(rawUrl || "").toLowerCase();
  let hostname = "";

  try {
    hostname = new URL(rawUrl).hostname.toLowerCase();
  } catch (_error) {
    hostname = "";
  }

  for (const rule of CATEGORY_RULES) {
    const hitKeyword = rule.keywords.some((word) =>
      text.includes(String(word).toLowerCase())
    );
    const hitDomain = rule.domains.some((domain) => hostname.includes(domain));
    const hitUrl = (rule.urlIncludes || []).some((part) => fullUrl.includes(part));
    if (hitKeyword || hitDomain || hitUrl) {
      return rule.name;
    }
  }

  return "其他";
}

function detectTopic(keyword) {
  const normalized = normalizeKeyword(keyword);
  if (!normalized) return "其他主题";

  for (const rule of TOPIC_ALIAS_RULES) {
    if (rule.patterns.some((part) => normalized.includes(part.toLowerCase()))) {
      return rule.topic;
    }
  }

  const firstToken = normalized.split(" ").find(Boolean) || "";
  if (firstToken.length >= 2) return firstToken.slice(0, 8);
  return normalized.slice(0, 8) || "其他主题";
}

async function loadRecords() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : [];
}

async function saveRecord(record) {
  const records = await loadRecords();

  const duplicate = records.find((item) => {
    const closeInTime =
      Math.abs(Number(item.timestamp || 0) - Number(record.timestamp || 0)) <=
      DEDUPE_WINDOW_MS;
    const sameKeyword =
      normalizeKeyword(item.keyword) === normalizeKeyword(record.keyword);
    const samePage = canonicalizeUrl(item.url) === canonicalizeUrl(record.url);
    return closeInTime && sameKeyword && samePage;
  });

  if (duplicate) {
    return;
  }

  records.unshift(record);

  if (records.length > MAX_RECORDS) {
    records.length = MAX_RECORDS;
  }

  await chrome.storage.local.set({ [STORAGE_KEY]: records });
}

async function handlePossibleSearch(url) {
  const keyword = parseSearchKeyword(url);
  if (!keyword) {
    return;
  }

  await saveRecord({
    keyword,
    url,
    category: detectCategory(url, keyword),
    topic: detectTopic(keyword),
    source: detectSource(url),
    timestamp: Date.now()
  });
}

function buildScreenshotSearchUrl(actionType, rawKeyword) {
  const template = SCREENSHOT_SEARCH_URLS[actionType];
  if (!template) return "";
  const keyword = String(rawKeyword || "").trim() || "截图搜索";
  return template.replace("{keyword}", encodeURIComponent(keyword));
}

async function startScreenshotSelectionFromActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id || !tab.url || tab.url.startsWith("chrome://")) {
    return false;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["screenshot-select.js"]
    });
    return true;
  } catch (_error) {
    return false;
  }
}

function bindSearchListeners() {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.url) {
      handlePossibleSearch(changeInfo.url);
    }
  });

  chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if (details.url) {
      handlePossibleSearch(details.url);
    }
  });

  chrome.webNavigation.onCommitted.addListener((details) => {
    if (details.frameId === 0 && details.url) {
      handlePossibleSearch(details.url);
    }
  });
}

bindSearchListeners();

chrome.commands.onCommand.addListener((command) => {
  if (command === "start-screenshot-search") {
    startScreenshotSelectionFromActiveTab();
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "START_SCREENSHOT_MODE") {
    startScreenshotSelectionFromActiveTab().then((ok) => {
      sendResponse({ ok });
    });
    return true;
  }

  if (message?.type !== "SCREENSHOT_SEARCH_ACTION") {
    return;
  }

  const payload = message.payload || {};
  const searchKeyword = payload.pageTitle || "截图搜索";
  const targetUrl = buildScreenshotSearchUrl(payload.actionType, searchKeyword);
  if (!targetUrl) {
    sendResponse({ ok: false });
    return;
  }

  chrome.tabs.create({ url: targetUrl }).then(() => {
    sendResponse({ ok: true });
  });

  return true;
});
