# Record---Search-History-Management-Tool

Remember everything you've searched for.

A Chrome extension that automatically records, smartly categorizes, and quickly retrieves all your search history across platforms. Solves the pain of limited search history, overwritten records, and forgotten content you didn't bookmark.


🎯 Problems We Solve


Pain Point	Description
Limited search history	Platforms only keep a few recent searches; new ones overwrite the old
Can't find past searches	Forgot the keywords or which platform you used
Saw it but didn't bookmark	Content you viewed but didn't save is gone forever
Fragmented across platforms	Each platform has its own isolated search history
✨ Key Features


🔍 Auto-record search history — Captures your search keywords across all platforms, unlimited entries, stored locally
📂 Smart categorization — Automatically identifies content type (Study, Work, Shopping, Entertainment, Life) — no manual sorting needed
🕐 Multi-dimensional search — Filter by time (Today/Yesterday/This Week/All), category, keyword, or source platform
🎬 Quick video search — One-click search on YouTube, Bilibili, Xiaohongshu, and Douyin for related video content
🔄 Smart deduplication — Duplicate keywords within a short time window are recorded only once
📍 Source platform identification — See at a glance which platform a search came from (Xiaohongshu, Taobao, Zhihu, etc.)
🖼️ Screenshots
Main Interface


Automatically records search history, grouped by time, with time-based filtering:


Today	Yesterday	This Week	All
✅	✅	✅	✅
Smart Categorization


Automatically classifies search content into categories with filter support.
Quick Video Search


Click the video icon next to any search result to instantly search on YouTube/Bilibili/Xiaohongshu/Douyin.
🛠️ Technical Implementation


Technology	Purpose
Chrome Extension API (Manifest V3)	Browser extension framework
JavaScript	Core logic development
Chrome Storage API	Local data persistence
Content Scripts	Page search behavior detection
Background Service Worker	Background event handling
Project Structure


plaintext
search-history-extension/
├── manifest.json        # Extension config (Manifest V3)
├── background.js        # Background service: event listening, search capture
├── content.js           # Content script: page search behavior detection
├── popup.html           # Popup interface
├── popup.js             # Popup interaction logic
└── styles.css           # UI styles

📥 Installation
Method 1: Developer Mode (Recommended)


Download the search-history-extension folder to your local machine
Open Chrome, navigate to chrome://extensions/
Enable Developer mode (top right)
Click Load unpacked
Select the downloaded search-history-extension folder
Done! The extension icon will appear in your browser toolbar
Method 2: Microsoft Edge


Download the folder
Navigate to edge://extensions/
Enable Developer mode (left side)
Click Load unpacked
Select the folder, done
🎮 Usage


Auto-starts after installation — Just browse and search normally, the extension records in the background
View history — Click the extension icon in the toolbar to open the search history panel
Filter & search — Use time tabs (Today/Yesterday/Week/All) for quick filtering
Keyword search — Type in the search box for fuzzy matching across all history
Video search — Click the video icon next to results to search on video platforms
🔒 Privacy


✅ All data is stored locally in your browser only
✅ No data is uploaded to any server
✅ No personal information is collected
✅ One-click clear all history supported
📋 Supported Platforms


Search Engines: Google, Baidu, Bing, Sogou


Social Platforms: Xiaohongshu, Bilibili, Zhihu, Douyin


Shopping Platforms: Taobao, JD.com


More platforms coming soon...
📌 Roadmap


 Cloud sync (end-to-end encrypted)
 Browsing behavior tracking & smart bookmarks
 Periodic review reminders
 Privacy mode (pause recording)
 Custom blacklist & keyword filtering
 Publish to Chrome Web Store
📄 License


MIT
记·录 — 搜索历史管理工具


你搜过的、你看过的，都帮你记住。


一款 Chrome 浏览器插件，帮你自动记录、智能分类、快速找回所有搜索历史。解决各平台搜索历史条数有限、新搜索覆盖旧记录、看过但未收藏的内容难以找回的痛点。


🎯 解决的问题


痛点	说明
搜索历史太短	各平台只保留十几条，新的把旧的挤掉了
找不回之前搜过的	忘了关键词，不知道在哪搜的
看过但没收藏	当时没收藏，想找的时候找不到了
多平台混乱	小红书、淘宝、B站各有各的历史，没法统一管理
✨ 核心功能


🔍 自动记录搜索历史 — 记录你在所有平台的搜索关键词，不限条数，本地存储
📂 智能分类 — 自动识别内容类型（学习、工作、购物、娱乐、生活），无需手动整理
🕐 多维度查找 — 按时间（今天/昨天/一周/全部）、分类、关键词、来源平台筛选
🎬 快速搜视频 — 一键在 YouTube、B站、小红书、抖音搜索相关视频内容
🔄 智能去重 — 相同关键词短时间内只记录一次，保持历史记录干净
📍 来源平台识别 — 一眼看出这条搜索来自哪个平台（小红书、淘宝、知乎等）
🖼️ 功能截图
主界面


自动记录搜索历史，按时间分组展示，支持时间筛选：


今天	昨天	一周	全部
✅	✅	✅	✅
智能分类


自动将搜索内容归类到对应类型，支持按分类筛选查看。
快速搜视频


点击搜索结果旁的视频图标，一键跳转到 YouTube/B站/小红书/抖音 搜索相关视频。
🛠️ 技术实现


技术	用途
Chrome Extension API (Manifest V3)	浏览器插件框架
JavaScript	核心逻辑开发
Chrome Storage API	本地数据持久化存储
Content Scripts	监听页面搜索行为
Background Service Worker	后台事件处理
项目结构


plaintext
search-history-extension/
├── manifest.json        # 插件配置（Manifest V3）
├── background.js        # 后台服务：事件监听、搜索捕获
├── content.js           # 内容脚本：页面搜索行为检测
├── popup.html           # 弹窗界面
├── popup.js             # 弹窗交互逻辑
└── styles.css           # 界面样式

📥 安装方式
方法一：开发者模式加载（推荐）


将 search-history-extension 文件夹下载到本地
打开 Chrome 浏览器，地址栏输入 chrome://extensions/
打开右上角 开发者模式
点击 加载已解压的扩展程序
选择下载的 search-history-extension 文件夹
安装完成！浏览器右上角会出现插件图标
方法二：Edge 浏览器安装


同样下载文件夹
地址栏输入 edge://extensions/
打开左侧 开发人员模式
点击 加载解压缩的扩展
选择文件夹，完成
🎮 使用方法


安装后自动运行 — 正常使用浏览器搜索即可，插件会在后台自动记录
查看历史 — 点击浏览器右上角插件图标，弹出搜索历史面板
筛选查找 — 使用时间标签（今天/昨天/一周/全部）快速筛选
搜索关键词 — 在搜索框输入关键词，模糊匹配历史记录
搜视频 — 点击搜索结果旁的视频图标，跳转到视频平台搜索
🔒 隐私说明


✅ 所有数据仅存储在本地浏览器中
✅ 不上传任何数据到服务器
✅ 不收集任何个人信息
✅ 支持一键清除所有历史记录
📋 支持的平台


搜索引擎： Google、百度、必应、搜狗


社交平台： 小红书、B站、知乎、抖音


购物平台： 淘宝、京东


持续增加中...
📌 未来规划


 云端同步（端到端加密）
 浏览行为记录与智能收藏
 定期回顾提醒
 隐私模式（暂停记录）
 自定义黑名单与关键词过滤
 发布到 Chrome 商店
📄 License


MIT
