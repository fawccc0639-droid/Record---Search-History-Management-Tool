# Search History Tracker (Chrome Extension)

一个基于 Manifest V3 的 Chrome 插件，用于记录网页搜索关键词和时间，并在弹窗中按时间与关键词查看历史。

## 功能

- 自动记录网址参数中的搜索词（如 `q`、`query`、`keyword`、`wd` 等）
- 保存到 `chrome.storage.local` 本地存储
- 点击插件图标弹出历史列表
- 时间筛选：今天、昨天、本周、全部
- 关键词搜索历史记录
- 简洁深浅色兼容界面
- 快捷键 `Ctrl+Shift+S` 启动截图框选模式（可选搜文字/视频/图片/商品）

## 安装方式（开发者模式）

1. 打开 Chrome，访问 `chrome://extensions/`
2. 右上角开启「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择本项目文件夹 `search-history-extension`
5. 固定插件图标后点击即可查看历史

## 文件结构

```text
search-history-extension/
├─ manifest.json
├─ background.js
├─ screenshot-select.js
├─ popup.html
├─ popup.css
├─ popup.js
└─ README.md
```
