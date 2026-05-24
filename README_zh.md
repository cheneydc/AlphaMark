# AlphaMark — AI 智能书签整理工具

基于 **Manifest V3** 的 Chrome 扩展，通过**关键词匹配 + LLM 语义分析 + 浏览历史洞察**，智能分类和整理你的浏览器书签。

---

## 功能特性

### 📊 智能书签分析
- **双引擎分类**：关键词引擎（14 个内置类别、380+ 关键词） + LLM 语义分类（Gemini / OpenAI / 自定义 API）
- **浏览历史集成**：高频访问的站点获得更高分类优先级
- **实时进度追踪**：推送 + 轮询双通道实时更新分析进度条
- **结果持久化**：关闭弹窗后分析继续，重开立即恢复当前进度

### 🧠 AI 智能推荐
- **新书签推荐**：收藏新页面时自动分析，推荐最佳分类目录
- **智能去重**：书签已在匹配的目录中时不打扰
- **确认再操作**：在弹窗横幅中确认或忽略建议
- **角标提醒**：扩展图标显示待确认建议数量

### 🔧 书签管理
- **批量整理**：一键将数百个书签移入分类目录
- **撤销支持**：三级回退机制（直接 → 路径 → 其他书签）
- **备份恢复**：JSON 格式导出/导入书签备份
- **分类管理**：设置中自定义类别和关键词

### ⚡ 性能优化
- **预计算关键词表**：模块初始化时预归一化，消除 38 万次正则调用
- **配置持久化**：扩展重载、升级、Service Worker 重启均不丢失设置
- **内存管理**：分析/整理完成后及时释放缓存

---

## 安装

1. 打开 `chrome://extensions`（Chrome / Edge / Brave）
2. 开启右上角**开发者模式**
3. 点击**加载已解压的扩展程序**，选择项目目录
4. 将 AlphaMark 图标固定到工具栏

## 快速开始

1. 点击 AlphaMark 图标打开弹窗
2. 点击 **🔍 分析书签** 对所有书签进行分类
3. 查看分类预览，点击类别展开详情
4. 点击 **📂 开始整理** 将书签移入分类目录

### 启用 AI 分类

1. 点击 ⚙ 进入设置
2. 开启 **🤖 AI 大模型设置**并配置：
   - **API 地址**：`https://api.openai.com/v1`（或其他兼容端点）
   - **模型名称**：`gpt-4o-mini`（或其他模型）
   - **API Key**：你的 API 密钥
3. 点击**测试连接**验证
4. 保存后在弹窗中开启 **AI** 开关

> 💡 **免费方案**：[Google Gemini](https://aistudio.google.com/apikey) 提供免费 API 配额。

### 新书签智能推荐

1. 弹窗中开启 **AI 开关** 🤖
2. 收藏任意新页面 — AlphaMark 自动分析
3. 打开弹窗查看建议横幅
4. 点击**确认**移入推荐目录，或**忽略**

---

## 架构

```
┌─────────────────────────────────────────────┐
│                  popup.html                  │
│  ┌───────────┐  ┌──────────┐                │
│  │ 书签整理   │  │ 访问历史  │                │
│  │  · 分析   │  │  · 统计  │                │
│  │  · 预览   │  │  · 热门  │                │
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
│书签 CRUD │  │ 30s 超时   │  │    API       │
└──────────┘  └────────────┘  └──────────────┘
```

## 文件结构

| 文件 | 职责 |
|------|------|
| `manifest.json` | 扩展配置、权限声明、入口点 |
| `classifier.js` | 关键词分类引擎（32 类别、800+ 关键词、预计算查找表） |
| `bookmarks.js` | 书签树遍历、文件夹 CRUD、批量移动、撤销恢复 |
| `llm.js` | LLM 提供商抽象层（OpenAI 兼容 / 自定义端点）、prompt 构建、响应解析 |
| `history.js` | Chrome History API 封装、域名聚合、访问频率加权 |
| `background.js` | Service Worker：分析编排、建议系统、消息路由、状态管理 |
| `popup.html/css/js` | 弹窗 UI：分析进度、分类预览、建议横幅、历史统计 |
| `options.html/css/js` | 设置 UI：LLM 配置、历史范围、分类管理 |
| `i18n.js` | 中英双语支持 |

## 权限说明

| 权限 | 用途 |
|------|------|
| `bookmarks` | 读取、创建、移动书签 |
| `storage` | 保存用户配置（LLM 密钥、历史范围、分类设置） |
| `tabs` | 与当前标签页交互 |
| `history` | 读取浏览历史用于权重分析 |
| `host_permissions` | 抓取网页 HTML 进行内容提取 |

## 分类流程

```
书签 (URL + 标题)
    │
    ├── 1. 域名匹配 ──────► 高置信度结果
    │    (weight ≥ 8 关键词出现在域名中)
    │
    ├── 2. 关键词打分 ────► 所有类别计分
    │    (> 380 关键词 × 中英双语)
    │
    ├── 3. LLM 语义分类 ──► 如已启用且配置完整
    │    (分批发送，最多 3 路并发)
    │
    └── 4. 兜底处理 ──────► 域名提取类别名
```

**置信度三级制**：`high`（得分 ≥ 15）、`medium`（≥ 8）、`low`（< 8）

## 内置类别（32 个）

| 类别 | 代表站点 |
|------|---------|
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

## 开发

```bash
# 运行全部单元测试（1144 个）
npm run test:all

# 单独运行各模块测试
npm run test:classifier   # 88 个测试
npm run test:llm          # 55 个测试
npm run test:history      # 47 个测试
npm run test:i18n         # 11 个测试
npm run test:bookmarks    # 21 个测试

# 在 Chrome 中加载扩展
npm start
```

### LLM 提供商

AlphaMark 支持所有 OpenAI 兼容的 API 端点。在设置中配置：

```json
{
  "provider": "custom",
  "customBaseUrl": "https://api.openai.com/v1",
  "customModel": "gpt-4o-mini",
  "apiKey": "sk-..."
}
```

支持的提供商：OpenAI、Google Gemini、任意 OpenAI 兼容端点（Ollama、LM Studio 等）

### 关键设计决策

| 决策 | 原因 |
|------|------|
| 关键词 + LLM 双引擎 | 关键词零成本且极快；LLM 处理长尾站点 |
| 推送 + 轮询双通道进度 | 推送保证实时性，轮询保证弹窗重开可靠性 |
| 建议而非自动移动 | 用户保持控制权，建议在弹窗中确认 |
| chrome.storage.local 持久化结果 | 弹窗关闭/Service Worker 重启后不丢失 |
| 预计算关键词查找表 | 消除每次分析 38 万次正则调用 |

---

## 作者

**cheneydc** · [cheneydc@gmail.com](mailto:cheneydc@gmail.com)

## 技术栈

| 层面 | 技术选型 |
|------|---------|
| 扩展框架 | Chrome Extension Manifest V3 |
| 后台进程 | Service Worker (ES Modules) |
| 前端 UI | 原生 HTML/CSS/JS — 零框架依赖 |
| 通信机制 | `chrome.runtime.sendMessage` |
| 数据存储 | `chrome.storage.sync`（配置） + `chrome.storage.local`（数据） |
| API | `chrome.bookmarks`、`chrome.history`、`chrome.action` |
| LLM 集成 | OpenAI 兼容 REST API（30s 超时、3 路并发） |
| 分类算法 | 加权关键词匹配 + 域名精确匹配 + LLM 语义分析 |
