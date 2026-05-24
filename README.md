# AlphaMark — AI-Powered Smart Bookmark Organizer

A Chrome Extension (Manifest V3) that intelligently classifies and organizes your bookmarks using **keyword matching + LLM semantic analysis + browsing history insights**.

---

## Features

### 📊 Smart Bookmark Analysis
- **Dual-engine classification**: Keyword matching (14 built-in categories, 380+ keywords) + LLM semantic classification (Gemini / OpenAI / custom API)
- **Browsing history integration**: Frequently visited sites get higher classification priority
- **Real-time progress**: Live progress tracking with push + poll dual-channel updates
- **Persistent results**: Analysis results survive popup close — reopen to continue where you left off

### 🧠 AI-Powered Suggestions
- **Smart bookmark recommendations**: When you bookmark a new page, AlphaMark analyzes it and suggests the best category folder
- **Context-aware**: Won't suggest if the bookmark is already in the right folder
- **Review before acting**: Confirm or dismiss suggestions in the popup banner
- **Badge notifications**: Extension icon shows pending suggestion count

### 🔧 Bookmark Management
- **Batch organize**: Move hundreds of bookmarks into categorized folders with one click
- **Undo support**: Full undo with 3-tier fallback recovery (direct → path → Other Bookmarks)
- **Backup & restore**: Export/import bookmark backups as JSON
- **Category management**: Customize categories and keywords in settings

### ⚡ Performance
- **Pre-computed keyword lookup**: Module-initialized normalized keyword tables eliminate 380K regex calls
- **Config persistence**: Settings survive extension reload, upgrade, and Service Worker restart
- **Efficient memory**: Analysis state cleaned up promptly after use

---

## Installation

1. Open `chrome://extensions` in Chrome / Edge / Brave
2. Enable **Developer Mode** (top-right toggle)
3. Click **Load unpacked** and select the project directory
4. Pin the AlphaMark icon to your toolbar

## Quick Start

1. Click the AlphaMark icon to open the popup
2. Click **🔍 Analyze** to classify all bookmarks
3. Review the preview — expand categories to see details
4. Click **📂 Start Organizing** to move bookmarks into folders

### Enable AI Classification

1. Click ⚙ to open Settings
2. Enable **🤖 AI Model** and configure your provider:
   - **API URL**: `https://api.openai.com/v1` (or Gemini / custom endpoint)
   - **Model**: `gpt-4o-mini` (or your preferred model)
   - **API Key**: Your provider's API key
3. Click **Test Connection** to verify
4. Save and toggle **AI** on in the popup

> 💡 **Free option**: [Google Gemini](https://aistudio.google.com/apikey) offers free API quotas.

### Smart Suggestions for New Bookmarks

1. In popup, enable the **AI toggle** 🤖
2. Bookmark any new page — AlphaMark analyzes it automatically
3. Open the popup to see the suggestion banner
4. Click **Confirm** to move to the suggested folder, or **Dismiss** to ignore

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                  popup.html                  │
│  ┌───────────┐  ┌──────────┐                │
│  │ Bookmarks │  │  History │                │
│  │  · Analyze│  │  · Stats │                │
│  │  · Preview│  │  · Top 20│                │
│  └─────┬─────┘  └──────────┘                │
└────────┼────────────────────────────────────┘
         │  chrome.runtime.sendMessage
         ▼
┌─────────────────────────────────────────────┐
│          background.js (Service Worker)      │
│  analyzeBookmarks  →  classifyWithLLM        │
│  executeOrganize   →  undoOrganize           │
│  onBookmarkCreated →  suggestCategory        │
└───────┬─────────────────────────────────────┘
        │              │               │
        ▼              ▼               ▼
┌───────────┐  ┌───────────┐  ┌───────────────┐
│classifier │  │  llm.js   │  │  history.js   │
│ 14 类别   │  │ LLM API   │  │ 访问频率分析   │
│ 380+ 关键词│  │ 自定义端点 │  │ 历史权重合并   │
└──────┬────┘  └─────┬─────┘  └──────┬────────┘
       │              │               │
       ▼              ▼               ▼
┌──────────┐  ┌────────────┐  ┌──────────────┐
│bookmarks │  │ Fetch API  │  │chrome.history│
│书签 CRUD │  │ 30s timeout│  │    API       │
└──────────┘  └────────────┘  └──────────────┘
```

## File Structure

| File | Responsibility |
|------|---------------|
| `manifest.json` | Extension config, permissions, entry points |
| `classifier.js` | Keyword classification engine (32 categories, 800+ keywords, pre-computed lookups) |
| `bookmarks.js` | Bookmark tree traversal, folder CRUD, batch move, undo/restore |
| `llm.js` | LLM provider abstraction (OpenAI-compatible / custom endpoint), prompt construction, response parsing |
| `history.js` | Chrome History API wrapper, domain aggregation, visit-frequency weighting |
| `background.js` | Service Worker: analysis orchestration, suggestion system, message routing, state management |
| `popup.html/css/js` | Popup UI: analysis progress, category preview, suggestions banner, history stats |
| `options.html/css/js` | Settings UI: LLM config, history range, category management |
| `i18n.js` | Chinese/English translations |

## Permissions

| Permission | Purpose |
|-----------|---------|
| `bookmarks` | Read, create, move bookmarks |
| `storage` | Save user config (LLM keys, history range, categories) |
| `tabs` | Interact with current tab |
| `history` | Read browsing history for weight analysis |
| `host_permissions` | Fetch page HTML for content extraction |

## Classification Pipeline

```
Bookmark (URL + Title)
    │
    ├── 1. Domain match ──────► High-confidence result
    │    (weight ≥ 8 keyword in hostname)
    │
    ├── 2. Keyword scoring ───► Score every category
    │    (> 380 keywords × 2 languages)
    │
    ├── 3. LLM semantic ──────► If enabled & configured
    │    (batched, 3 concurrent calls max)
    │
    └── 4. Fallback ──────────► Domain-derived category name
```

**Confidence levels**: `high` (score ≥ 15), `medium` (≥ 8), `low` (< 8)

## Built-in Categories (32)

| Category | Example Sites |
|----------|--------------|
| 社交与通讯 | facebook, twitter, weibo, bilibili |
| 新闻与资讯 | bbc, reuters, techcrunch, 今日头条 |
| 技术与编程 | github, stackoverflow, npm, docker, CSDN |
| 购物与电商 | amazon, taobao, jd.com, pinduoduo |
| 娱乐与视频 | youtube, netflix, spotify, iqiyi |
| 教育学习 | coursera, udemy, w3schools, 慕课网 |
| 金融理财 | paypal, coinbase, tradingview, 支付宝 |
| 旅游出行 | airbnb, skyscanner, ctrip, 携程 |
| 美食烹饪 | doordash, ubereats, 美团, 下厨房 |
| 体育健身 | nba, espn, 虎扑, Keep |
| 健康医疗 | webmd, mayoclinic, 丁香园 |
| 效率工具 | notion, trello, figma, 飞书, 钉钉 |
| 设计与创意 | dribbble, behance, unsplash, 站酷 |
| 政府与参考 | .gov, .gov.cn, nih.gov |
| 人工智能 | openai, huggingface, kaggle, langchain |
| 电子游戏 | steam, nintendo, playstation, xbox |
| 阅读与写作 | goodreads, substack, medium, wordpress |
| 音频与音乐 | spotify, soundcloud, apple podcasts |
| 摄影与图像 | flickr, 500px, lightroom, photoshop |
| 云计算与DevOps | aws, azure, gcp, terraform, vercel |
| 数据库与存储 | mysql, postgresql, mongodb, redis |
| 网络安全 | owasp, hackerone, shodan, virustotal |
| 求职招聘 | linkedin, indeed, glassdoor, BOSS直聘 |
| 房地产与家居 | zillow, ikea, 链家, 贝壳 |
| 汽车与交通 | tesla, bmw, 汽车之家, 懂车帝 |
| 法律与法规 | law, legal, copyright, patent |
| 科学探索 | nasa, spacex, nature, nationalgeographic |
| 宠物与动物 | pet, dog, cat, veterinary |
| 营销与运营 | seo, google analytics, hubspot |
| 操作系统 | linux, ubuntu, windows, macos |
| 数据与AI资产 | dataset, spark, tableau, powerbi |
| 企业服务 | sap, salesforce, datadog, okta |

## Development

```bash
# Run all unit tests (1144 tests)
npm run test:all

# Run individual test suites
npm run test:classifier   # 88 tests
npm run test:llm          # 55 tests
npm run test:history      # 47 tests
npm run test:i18n         # 11 tests
npm run test:bookmarks    # 21 tests

# Load extension in Chrome
npm start
```

### LLM Providers

AlphaMark supports any OpenAI-compatible API endpoint. Configure in Settings:

```json
{
  "provider": "custom",
  "customBaseUrl": "https://api.openai.com/v1",
  "customModel": "gpt-4o-mini",
  "apiKey": "sk-..."
}
```

Supported providers: OpenAI, Google Gemini, any OpenAI-compatible endpoint (Ollama, LM Studio, etc.)

### Key Design Decisions

| Decision | Rationale |
|----------|----------|
| Keyword + LLM dual-engine | Keyword is 0-cost and fast; LLM handles long-tail sites |
| Push + poll progress | Messages for speed, polling for popup-reopen reliability |
| Suggestion over auto-move | User remains in control; suggestions shown in popup banner |
| chrome.storage.local for results | Persists across popup close/service worker restart |
| Pre-computed keyword lookup | Eliminates 380K regex calls per analysis |

---

## Author

**cheneydc** · [cheneydc@gmail.com](mailto:cheneydc@gmail.com)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Extension Framework | Chrome Extension Manifest V3 |
| Background | Service Worker (ES Modules) |
| Frontend | Native HTML/CSS/JS — zero framework dependencies |
| Communication | `chrome.runtime.sendMessage` |
| Storage | `chrome.storage.sync` (config) + `chrome.storage.local` (data) |
| APIs | `chrome.bookmarks`, `chrome.history`, `chrome.action` |
| LLM Integration | OpenAI-compatible REST API (30s timeout, 3 concurrent calls) |
| Classification | Weighted keyword matching + domain match + LLM semantic |
