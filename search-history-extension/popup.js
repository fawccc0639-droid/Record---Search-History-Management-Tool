const STORAGE_KEY = "searchHistoryRecords";
const CATEGORY_ORDER = ["学习", "工作", "购物", "娱乐", "生活", "其他"];
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
const RESEARCH_PLATFORMS = [
  { name: "Google", urlTemplate: "https://www.google.com/search?q={keyword}" },
  { name: "百度", urlTemplate: "https://www.baidu.com/s?wd={keyword}" },
  { name: "小红书", urlTemplate: "https://www.xiaohongshu.com/search_result?keyword={keyword}" },
  { name: "B站", urlTemplate: "https://search.bilibili.com/all?keyword={keyword}" },
  { name: "知乎", urlTemplate: "https://www.zhihu.com/search?q={keyword}" },
  { name: "淘宝", urlTemplate: "https://s.taobao.com/search?q={keyword}" },
  { name: "京东", urlTemplate: "https://search.jd.com/Search?keyword={keyword}" }
];
const VIDEO_PLATFORMS = [
  { name: "YouTube", urlTemplate: "https://www.youtube.com/results?search_query={keyword}" },
  { name: "小红书", urlTemplate: "https://www.xiaohongshu.com/search_result?keyword={keyword}" },
  { name: "B站", urlTemplate: "https://search.bilibili.com/all?keyword={keyword}" },
  { name: "抖音", urlTemplate: "https://www.douyin.com/search/{keyword}" }
];

const state = {
  range: "today",
  category: "all",
  topic: "all",
  keywordText: "",
  records: []
};

const historyListEl = document.getElementById("historyList");
const emptyStateEl = document.getElementById("emptyState");
const statsEl = document.getElementById("stats");
const keywordInputEl = document.getElementById("keywordInput");
const timeFiltersEl = document.getElementById("timeFilters");
const categoryFiltersEl = document.getElementById("categoryFilters");
const topicFiltersEl = document.getElementById("topicFilters");
const clearBtnEl = document.getElementById("clearBtn");
const screenshotBtnEl = document.getElementById("screenshotBtn");

function detectCategory(rawUrl, keyword) {
  const text = `${keyword || ""}`.toLowerCase();
  const fullUrl = String(rawUrl || "").toLowerCase();
  let hostname = "";
  try {
    hostname = new URL(rawUrl || "").hostname.toLowerCase();
  } catch (_error) {
    hostname = "";
  }

  for (const rule of CATEGORY_RULES) {
    const hitKeyword = rule.keywords.some((word) =>
      text.includes(String(word).toLowerCase())
    );
    const hitDomain = rule.domains.some((domain) => hostname.includes(domain));
    const hitUrl = (rule.urlIncludes || []).some((part) => fullUrl.includes(part));
    if (hitKeyword || hitDomain || hitUrl) return rule.name;
  }
  return "其他";
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

function normalizeKeyword(keyword) {
  return String(keyword || "")
    .trim()
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function getRangeBoundary(range) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === "today") return todayStart.getTime();
  if (range === "yesterday") {
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    return { start: yesterdayStart.getTime(), end: todayStart.getTime() };
  }
  if (range === "week") {
    const day = todayStart.getDay();
    const mondayOffset = day === 0 ? 6 : day - 1;
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - mondayOffset);
    return weekStart.getTime();
  }
  return 0;
}

function inRange(record, range) {
  const boundary = getRangeBoundary(range);
  const time = record.timestamp;
  if (range === "yesterday") return time >= boundary.start && time < boundary.end;
  return time >= boundary;
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleString("zh-CN", { hour12: false });
}

function formatUrlShort(rawUrl) {
  try {
    const url = new URL(rawUrl || "");
    const path = url.pathname && url.pathname !== "/" ? url.pathname : "";
    return `${url.hostname}${path}`.slice(0, 48);
  } catch (_error) {
    return String(rawUrl || "").slice(0, 48);
  }
}

function buildPlatformSearchUrl(platformName, keyword, platformList) {
  const platform = platformList.find((item) => item.name === platformName);
  if (!platform) return "";
  return platform.urlTemplate.replace("{keyword}", encodeURIComponent(keyword));
}

function closeAllMenus() {
  historyListEl.querySelectorAll(".action-menu").forEach((menu) => {
    menu.classList.add("hidden");
  });
}

function getBaseFilteredRecords() {
  const keyword = state.keywordText.trim().toLowerCase();
  return state.records.filter((record) => {
    const passRange = inRange(record, state.range);
    const passCategory = state.category === "all" ? true : record.category === state.category;
    const passKeyword = keyword ? record.keyword.toLowerCase().includes(keyword) : true;
    return passRange && passCategory && passKeyword;
  });
}

function groupByCategory(records) {
  const map = new Map();
  records.forEach((record) => {
    if (!map.has(record.category)) map.set(record.category, []);
    map.get(record.category).push(record);
  });

  const unknownCategories = [...map.keys()]
    .filter((category) => !CATEGORY_ORDER.includes(category))
    .sort();
  const sortedCategories = [...CATEGORY_ORDER, ...unknownCategories].filter((category) =>
    map.has(category)
  );
  return sortedCategories.map((category) => ({ category, items: map.get(category) }));
}

function renderTopicFilters() {
  const baseRecords = getBaseFilteredRecords();
  const topicCountMap = new Map();
  baseRecords.forEach((record) => {
    topicCountMap.set(record.topic, (topicCountMap.get(record.topic) || 0) + 1);
  });

  const sortedTopics = [...topicCountMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  topicFiltersEl.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.className = "topic-chip";
  allBtn.type = "button";
  allBtn.dataset.topic = "all";
  allBtn.textContent = `全部主题（${baseRecords.length}）`;
  allBtn.classList.toggle("active", state.topic === "all");
  topicFiltersEl.appendChild(allBtn);

  sortedTopics.forEach(([topic, count]) => {
    const btn = document.createElement("button");
    btn.className = "topic-chip";
    btn.type = "button";
    btn.dataset.topic = topic;
    btn.textContent = `${topic}（${count}）`;
    btn.classList.toggle("active", state.topic === topic);
    topicFiltersEl.appendChild(btn);
  });

  if (state.topic !== "all" && !sortedTopics.some(([topic]) => topic === state.topic)) {
    state.topic = "all";
  }
}

function render(records) {
  historyListEl.innerHTML = "";
  const count = records.length;
  const groupCount = groupByCategory(records).length;
  const topicCount = new Set(records.map((record) => record.topic)).size;
  statsEl.textContent = `共 ${count} 条记录，${groupCount} 个分类，${topicCount} 个主题`;

  if (!count) {
    emptyStateEl.classList.remove("hidden");
    return;
  }
  emptyStateEl.classList.add("hidden");

  const fragment = document.createDocumentFragment();
  groupByCategory(records).forEach((group) => {
    const title = document.createElement("li");
    title.className = "group-title";
    title.textContent = `${group.category}（${group.items.length}）`;
    fragment.appendChild(title);

    group.items.forEach((record) => {
      const item = document.createElement("li");
      item.className = "history-item";

      const badge = document.createElement("span");
      badge.className = "category-badge";
      badge.textContent = `${record.category} / ${record.topic}`;

      const keyword = document.createElement("p");
      keyword.className = "item-keyword";
      keyword.textContent = record.keyword;

      const meta = document.createElement("div");
      meta.className = "item-meta";
      const source = document.createElement("span");
      source.className = "item-source";
      source.textContent = record.source || detectSource(record.url);
      const time = document.createElement("span");
      time.textContent = formatTime(record.timestamp);
      const url = document.createElement("span");
      url.className = "item-url";
      url.title = record.url;
      url.textContent = formatUrlShort(record.url);

      meta.appendChild(source);
      meta.appendChild(time);
      meta.appendChild(url);

      const actions = document.createElement("div");
      actions.className = "item-actions";
      const actionConfigs = [
        {
          triggerClass: "research-trigger",
          triggerText: "重搜",
          menuClass: "research-menu",
          optionClass: "research-option",
          actionType: "research",
          platforms: RESEARCH_PLATFORMS
        },
        {
          triggerClass: "video-trigger",
          triggerText: "搜视频",
          menuClass: "video-menu",
          optionClass: "video-option",
          actionType: "video",
          platforms: VIDEO_PLATFORMS
        }
      ];

      actionConfigs.forEach((config) => {
        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = config.triggerClass;
        trigger.textContent = config.triggerText;

        const menu = document.createElement("div");
        menu.className = `${config.menuClass} action-menu hidden`;
        config.platforms.forEach((platform) => {
          const option = document.createElement("button");
          option.type = "button";
          option.className = config.optionClass;
          option.dataset.platform = platform.name;
          option.dataset.keyword = record.keyword;
          option.dataset.actionType = config.actionType;
          option.textContent = platform.name;
          menu.appendChild(option);
        });

        actions.appendChild(trigger);
        actions.appendChild(menu);
      });

      item.appendChild(badge);
      item.appendChild(keyword);
      item.appendChild(meta);
      item.appendChild(actions);
      fragment.appendChild(item);
    });
  });

  historyListEl.appendChild(fragment);
}

function applyFilters() {
  renderTopicFilters();
  const filtered = getBaseFilteredRecords().filter((record) =>
    state.topic === "all" ? true : record.topic === state.topic
  );
  render(filtered);
}

async function loadRecords() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  const records = Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : [];
  const deduped = [];
  const seen = new Set();
  records.forEach((record) => {
    const key = `${normalizeKeyword(record.keyword)}|${canonicalizeUrl(record.url)}`;
    if (seen.has(key)) return;
    seen.add(key);
    deduped.push(record);
  });

  state.records = deduped.map((record) => ({
    ...record,
    category: record.category || detectCategory(record.url, record.keyword),
    topic: record.topic || detectTopic(record.keyword),
    source: record.source || detectSource(record.url)
  }));
  applyFilters();
}

function bindEvents() {
  timeFiltersEl.addEventListener("click", (event) => {
    const btn = event.target.closest(".filter-btn");
    if (!btn) return;
    state.range = btn.dataset.range || "today";
    [...timeFiltersEl.querySelectorAll(".filter-btn")].forEach((el) => {
      el.classList.toggle("active", el === btn);
    });
    applyFilters();
  });

  keywordInputEl.addEventListener("input", (event) => {
    state.keywordText = event.target.value || "";
    applyFilters();
  });

  categoryFiltersEl.addEventListener("click", (event) => {
    const btn = event.target.closest(".chip-btn");
    if (!btn) return;
    state.category = btn.dataset.category || "all";
    [...categoryFiltersEl.querySelectorAll(".chip-btn")].forEach((el) => {
      el.classList.toggle("active", el === btn);
    });
    applyFilters();
  });

  topicFiltersEl.addEventListener("click", (event) => {
    const btn = event.target.closest(".topic-chip");
    if (!btn) return;
    state.topic = btn.dataset.topic || "all";
    applyFilters();
  });

  historyListEl.addEventListener("click", async (event) => {
    const trigger = event.target.closest(".research-trigger, .video-trigger");
    if (trigger) {
      const container = trigger.closest(".item-actions");
      if (!container) return;
      const targetMenu = trigger.classList.contains("video-trigger")
        ? container.querySelector(".video-menu")
        : container.querySelector(".research-menu");
      if (!targetMenu) return;
      const shouldOpen = targetMenu.classList.contains("hidden");
      closeAllMenus();
      targetMenu.classList.toggle("hidden", !shouldOpen);
      return;
    }

    const option = event.target.closest(".research-option, .video-option");
    if (!option) return;
    const platform = option.dataset.platform || "";
    const keyword = option.dataset.keyword || "";
    const actionType = option.dataset.actionType || "research";
    const platformList =
      actionType === "video" ? VIDEO_PLATFORMS : RESEARCH_PLATFORMS;
    const targetUrl = buildPlatformSearchUrl(platform, keyword, platformList);
    closeAllMenus();
    if (!targetUrl) return;
    await chrome.tabs.create({ url: targetUrl });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".item-actions")) {
      closeAllMenus();
    }
  });

  screenshotBtnEl.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "START_SCREENSHOT_MODE" }, () => {
      window.close();
    });
  });

  clearBtnEl.addEventListener("click", async () => {
    await chrome.storage.local.set({ [STORAGE_KEY]: [] });
    state.records = [];
    state.topic = "all";
    applyFilters();
  });
}

bindEvents();
loadRecords();
