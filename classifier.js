// 分类词汇库 - 关键词与权重配置（32 个内置分类）
const CATEGORIES = {
  "社交与通讯": {
    keywords: [
      { word: "facebook", weight: 10 }, { word: "twitter", weight: 10 }, { word: "x.com", weight: 10 },
      { word: "instagram", weight: 10 }, { word: "linkedin", weight: 9 }, { word: "reddit", weight: 8 },
      { word: "discord", weight: 9 }, { word: "telegram", weight: 9 }, { word: "whatsapp", weight: 9 },
      { word: "messenger", weight: 8 }, { word: "slack", weight: 8 }, { word: "tiktok", weight: 9 },
      { word: "weibo", weight: 9 }, { word: "wechat", weight: 9 }, { word: "qq", weight: 9 },
      { word: "douyin", weight: 9 }, { word: "zhihu", weight: 8 }, { word: "bilibili", weight: 9 },
      { word: "snapchat", weight: 8 }, { word: "pinterest", weight: 8 }, { word: "tumblr", weight: 8 },
      { word: "mastodon", weight: 7 }, { word: "threads", weight: 8 }, { word: "signal", weight: 7 },
      { word: "微博", weight: 9 }, { word: "微信", weight: 9 }, { word: "知乎", weight: 8 },
      { word: "抖音", weight: 9 }, { word: "哔哩哔哩", weight: 9 }, { word: "B站", weight: 9 },
      { word: "小红书", weight: 9 }, { word: "豆瓣", weight: 8 }, { word: "快手", weight: 8 },
      { word: "贴吧", weight: 7 }, { word: "即刻", weight: 7 }, { word: "Soul", weight: 6 },
      { word: "social", weight: 3 }, { word: "community", weight: 3 },
      { word: "forum", weight: 3 }, { word: "chat", weight: 3 }
    ]
  },
  "新闻与资讯": {
    keywords: [
      { word: "news", weight: 7 }, { word: "news.ycombinator", weight: 9 }, { word: "hackernews", weight: 8 },
      { word: "cnn", weight: 8 }, { word: "bbc", weight: 8 }, { word: "reuters", weight: 9 },
      { word: "nytimes", weight: 8 }, { word: "wsj", weight: 8 }, { word: "bloomberg", weight: 8 },
      { word: "theguardian", weight: 7 }, { word: "washingtonpost", weight: 7 }, { word: "usatoday", weight: 7 },
      { word: "economist", weight: 8 }, { word: "forbes", weight: 7 }, { word: "techcrunch", weight: 8 },
      { word: "theverge", weight: 8 }, { word: "wired", weight: 8 }, { word: "arstechnica", weight: 8 },
      { word: "engadget", weight: 7 }, { word: "gizmodo", weight: 7 }, { word: "axios", weight: 7 },
      { word: "semafor", weight: 6 }, { word: "politico", weight: 7 }, { word: "aljazeera", weight: 7 },
      { word: "nikkei", weight: 7 }, { word: "ft.com", weight: 8 }, { word: "apnews", weight: 7 },
      { word: "npr", weight: 7 }, { word: "buzzfeed", weight: 5 }, { word: "vox", weight: 6 },
      { word: "日报", weight: 4 }, { word: "新闻", weight: 4 }, { word: "资讯", weight: 3 },
      { word: "头条", weight: 3 }, { word: "快讯", weight: 3 }, { word: "breaking", weight: 3 },
      { word: "headline", weight: 3 }, { word: "medium", weight: 5 },
      { word: "今日头条", weight: 8 }, { word: "腾讯新闻", weight: 7 }, { word: "网易新闻", weight: 7 },
      { word: "新浪新闻", weight: 7 }, { word: "凤凰网", weight: 7 }, { word: "观察者网", weight: 6 },
      { word: "澎湃新闻", weight: 7 }, { word: "虎嗅", weight: 6 }, { word: "36氪", weight: 7 },
      { word: "环球网", weight: 6 }, { word: "新华网", weight: 7 }, { word: "人民网", weight: 7 }
    ]
  },
  "技术与编程": {
    keywords: [
      { word: "github", weight: 10 }, { word: "gitlab", weight: 9 }, { word: "bitbucket", weight: 8 },
      { word: "stackoverflow", weight: 10 }, { word: "stackexchange", weight: 8 },
      { word: "npmjs", weight: 9 }, { word: "pypi", weight: 9 }, { word: "crates.io", weight: 9 },
      { word: "deno.land", weight: 7 }, { word: "nuget", weight: 7 }, { word: "mvnrepository", weight: 7 },
      { word: "docker", weight: 9 }, { word: "kubernetes", weight: 8 }, { word: "k8s", weight: 9 },
      { word: "openstack", weight: 9 }, { word: "dev.to", weight: 8 }, { word: "hashnode", weight: 7 },
      { word: "codepen", weight: 8 }, { word: "jsfiddle", weight: 8 }, { word: "codesandbox", weight: 8 },
      { word: "replit", weight: 8 }, { word: "leetcode", weight: 8 }, { word: "hackerrank", weight: 8 },
      { word: "codeforces", weight: 8 }, { word: "codewars", weight: 7 },
      { word: "csdn", weight: 9 }, { word: "segmentfault", weight: 8 },
      { word: "juejin", weight: 8 }, { word: "掘金", weight: 8 }, { word: "v2ex", weight: 8 },
      { word: "cnblogs", weight: 8 }, { word: "博客园", weight: 8 }, { word: "jianshu", weight: 8 },
      { word: "简书", weight: 8 }, { word: "oschina", weight: 8 }, { word: "开源中国", weight: 8 },
      { word: "思否", weight: 8 }, { word: "Gitee", weight: 8 },
      { word: "码云", weight: 7 }, { word: "CSDN", weight: 8 },
      { word: "freebuf", weight: 8 }, { word: "FreeBuf", weight: 8 },
      { word: "dockone", weight: 7 }, { word: "lenciel", weight: 7 },
      { word: "sspai", weight: 7 }, { word: "少数派", weight: 7 },
      { word: "infoq", weight: 8 }, { word: "51cto", weight: 8 },
      { word: "kancloud", weight: 7 }, { word: "readthedocs", weight: 8 },
      { word: "gitbook", weight: 7 }, { word: "imooc", weight: 8 },
      { word: "code", weight: 3 }, { word: "dev", weight: 3 }, { word: "编程", weight: 4 },
      { word: "开发", weight: 3 }, { word: "技术", weight: 3 }, { word: "framework", weight: 3 },
      { word: "api", weight: 3 }, { word: "docs", weight: 3 }, { word: "documentation", weight: 3 },
      { word: "tutorial", weight: 3 }, { word: "blog", weight: 2 },
      { word: "programming", weight: 3 }, { word: "software", weight: 3 },
      { word: "algorithm", weight: 3 }, { word: "数据结构", weight: 3 }
    ]
  },
  "购物与电商": {
    keywords: [
      { word: "amazon", weight: 9 }, { word: "ebay", weight: 8 }, { word: "aliexpress", weight: 8 },
      { word: "taobao", weight: 9 }, { word: "tmall", weight: 9 }, { word: "jd.com", weight: 9 },
      { word: "pinduoduo", weight: 8 }, { word: "walmart", weight: 7 }, { word: "target", weight: 7 },
      { word: "bestbuy", weight: 7 }, { word: "etsy", weight: 8 }, { word: "shopify", weight: 7 },
      { word: "shein", weight: 7 }, { word: "zalando", weight: 6 }, { word: "costco", weight: 7 },
      { word: "rakuten", weight: 7 }, { word: "mercado", weight: 6 },
      { word: "shop", weight: 3 }, { word: "store", weight: 3 },
      { word: "buy", weight: 3 }, { word: "price", weight: 2 }, { word: "deal", weight: 2 },
      { word: "discount", weight: 2 }, { word: "coupon", weight: 3 }, { word: "购物", weight: 4 },
      { word: "商城", weight: 3 }, { word: "秒杀", weight: 3 },
      { word: "淘宝", weight: 9 }, { word: "天猫", weight: 9 }, { word: "京东", weight: 9 },
      { word: "拼多多", weight: 8 }, { word: "闲鱼", weight: 7 }, { word: "苏宁", weight: 7 },
      { word: "当当", weight: 7 }, { word: "唯品会", weight: 7 }, { word: "得物", weight: 7 },
      { word: "smzdm", weight: 8 }, { word: "什么值得买", weight: 8 },
      { word: "ecommerce", weight: 3 }, { word: "零售", weight: 3 }
    ]
  },
  "娱乐与视频": {
    keywords: [
      { word: "youtube", weight: 10 }, { word: "youtu.be", weight: 10 },
      { word: "netflix", weight: 9 }, { word: "hulu", weight: 8 }, { word: "disneyplus", weight: 8 },
      { word: "hbomax", weight: 8 }, { word: "primevideo", weight: 8 }, { word: "crunchyroll", weight: 7 },
      { word: "iqiyi", weight: 8 }, { word: "youku", weight: 8 }, { word: "vimeo", weight: 7 },
      { word: "dailymotion", weight: 7 }, { word: "anime", weight: 4 }, { word: "动漫", weight: 4 },
      { word: "movie", weight: 3 }, { word: "film", weight: 3 }, { word: "cinema", weight: 3 },
      { word: "综艺", weight: 3 }, { word: "video", weight: 2 },
      { word: "watch", weight: 2 }, { word: "stream", weight: 2 }, { word: "live", weight: 2 },
      { word: "tv", weight: 2 }, { word: "television", weight: 3 }, { word: "series", weight: 2 },
      { word: "episode", weight: 2 }, { word: "live.bilibili", weight: 8 },
      { word: "爱奇艺", weight: 8 }, { word: "优酷", weight: 8 }, { word: "腾讯视频", weight: 8 },
      { word: "芒果TV", weight: 7 }, { word: "西瓜视频", weight: 7 }, { word: "搜狐视频", weight: 6 },
      { word: "电视剧", weight: 3 }, { word: "电影", weight: 3 }
    ]
  },
  "教育学习": {
    keywords: [
      { word: "coursera", weight: 9 }, { word: "udemy", weight: 9 }, { word: "edx", weight: 9 },
      { word: "khanacademy", weight: 9 }, { word: "udacity", weight: 8 }, { word: "skillshare", weight: 8 },
      { word: "pluralsight", weight: 8 }, { word: "lynda", weight: 8 }, { word: "linkedin/learning", weight: 8 },
      { word: "freecodecamp", weight: 8 }, { word: "codecademy", weight: 8 }, { word: "w3schools", weight: 8 },
      { word: "datacamp", weight: 7 }, { word: "brilliant", weight: 7 }, { word: "masterclass", weight: 7 },
      { word: "mozilla.org", weight: 7 },
      { word: "learn", weight: 2 }, { word: "course", weight: 2 },
      { word: "education", weight: 2 }, { word: "university", weight: 3 }, { word: "college", weight: 3 },
      { word: "学校", weight: 3 }, { word: "教程", weight: 3 }, { word: "学习", weight: 3 },
      { word: "教育", weight: 3 }, { word: "training", weight: 2 }, { word: "lecture", weight: 2 },
      { word: "academy", weight: 3 }, { word: "wiki", weight: 3 }, { word: "encyclopedia", weight: 3 },
      { word: "scholar", weight: 4 }, { word: "research", weight: 3 }, { word: "paper", weight: 2 },
      { word: "exam", weight: 2 }, { word: "certification", weight: 2 },
      { word: "math", weight: 2 }, { word: "science", weight: 2 },
      { word: "arxiv", weight: 8 },
      { word: "慕课网", weight: 7 }, { word: "极客时间", weight: 7 },
      { word: "中国大学MOOC", weight: 7 }, { word: "学堂在线", weight: 6 },
      { word: "网易云课堂", weight: 7 }, { word: "知识星球", weight: 6 },
      { word: "考试", weight: 2 }, { word: "考研", weight: 3 }
    ]
  },
  "金融理财": {
    keywords: [
      { word: "paypal", weight: 8 }, { word: "stripe", weight: 7 }, { word: "coinbase", weight: 8 },
      { word: "binance", weight: 8 }, { word: "okx", weight: 7 }, { word: "bybit", weight: 7 },
      { word: "bank", weight: 5 }, { word: "banking", weight: 5 },
      { word: "finance", weight: 5 }, { word: "stock", weight: 5 }, { word: "trade", weight: 3 },
      { word: "invest", weight: 5 }, { word: "crypto", weight: 5 }, { word: "bitcoin", weight: 6 },
      { word: "ethereum", weight: 6 }, { word: "solana", weight: 5 }, { word: "defi", weight: 5 },
      { word: "区块链", weight: 4 }, { word: "金融", weight: 4 },
      { word: "理财", weight: 4 }, { word: "基金", weight: 4 }, { word: "股票", weight: 4 },
      { word: "保险", weight: 3 }, { word: "期货", weight: 3 },
      { word: "invesco", weight: 6 }, { word: "fidelity", weight: 6 }, { word: "vanguard", weight: 6 },
      { word: "robinhood", weight: 7 }, { word: "etoro", weight: 6 }, { word: "tradingview", weight: 7 },
      { word: "schwab", weight: 6 }, { word: "morningstar", weight: 6 }, { word: "yahoo.finance", weight: 6 },
      { word: "支付宝", weight: 8 }, { word: "微信支付", weight: 7 }, { word: "蚂蚁财富", weight: 7 },
      { word: "雪球", weight: 7 }, { word: "东方财富", weight: 7 }, { word: "同花顺", weight: 7 },
      { word: "招商银行", weight: 6 }, { word: "工商银行", weight: 6 }
    ]
  },
  "旅游出行": {
    keywords: [
      { word: "booking", weight: 7 }, { word: "airbnb", weight: 8 }, { word: "expedia", weight: 7 },
      { word: "tripadvisor", weight: 7 }, { word: "trip", weight: 4 }, { word: "travel", weight: 4 },
      { word: "hotel", weight: 4 }, { word: "flight", weight: 4 }, { word: "airline", weight: 4 },
      { word: "机票", weight: 4 }, { word: "酒店", weight: 4 }, { word: "旅游", weight: 4 },
      { word: "旅行", weight: 3 }, { word: "ctrip", weight: 7 }, { word: "qunar", weight: 7 },
      { word: "skyscanner", weight: 7 }, { word: "kayak", weight: 7 }, { word: "google.com/flights", weight: 7 },
      { word: "地图", weight: 3 }, { word: "map", weight: 3 }, { word: "导航", weight: 3 },
      { word: "google.com/maps", weight: 7 }, { word: "openstreetmap", weight: 6 },
      { word: "携程", weight: 7 }, { word: "去哪儿", weight: 7 }, { word: "飞猪", weight: 7 },
      { word: "马蜂窝", weight: 7 }, { word: "滴滴", weight: 7 }, { word: "高德", weight: 6 },
      { word: "12306", weight: 7 }
    ]
  },
  "美食烹饪": {
    keywords: [
      { word: "recipe", weight: 4 }, { word: "cooking", weight: 4 }, { word: "food", weight: 3 },
      { word: "restaurant", weight: 3 }, { word: "delivery", weight: 3 }, { word: "外卖", weight: 4 },
      { word: "美食", weight: 4 }, { word: "食谱", weight: 4 }, { word: "厨房", weight: 3 },
      { word: "烹饪", weight: 3 }, { word: "kitchen", weight: 3 }, { word: "bake", weight: 3 },
      { word: "cook", weight: 3 }, { word: "yummy", weight: 3 }, { word: "tasty", weight: 3 },
      { word: "dining", weight: 2 }, { word: "cuisine", weight: 3 }, { word: "chef", weight: 3 },
      { word: "doordash", weight: 5 }, { word: "ubereats", weight: 5 }, { word: "grubhub", weight: 5 },
      { word: "meituan", weight: 5 }, { word: "eleme", weight: 5 },
      { word: "allrecipes", weight: 6 }, { word: "seriouseats", weight: 5 },
      { word: "美团", weight: 8 }, { word: "饿了么", weight: 8 }, { word: "大众点评", weight: 7 },
      { word: "下厨房", weight: 6 }, { word: "豆果美食", weight: 5 }
    ]
  },
  "体育健身": {
    keywords: [
      { word: "nba", weight: 7 }, { word: "nfl", weight: 7 }, { word: "mlb", weight: 7 },
      { word: "nhl", weight: 6 }, { word: "fifa", weight: 6 }, { word: "espn", weight: 7 },
      { word: "olympics", weight: 6 }, { word: "formula1", weight: 6 }, { word: "uefa", weight: 6 },
      { word: "sport", weight: 3 }, { word: "sports", weight: 3 }, { word: "fitness", weight: 3 },
      { word: "gym", weight: 3 }, { word: "workout", weight: 3 }, { word: "exercise", weight: 3 },
      { word: "soccer", weight: 3 }, { word: "football", weight: 3 }, { word: "basketball", weight: 3 },
      { word: "tennis", weight: 3 }, { word: "running", weight: 3 }, { word: "cycling", weight: 3 },
      { word: "swimming", weight: 3 }, { word: "yoga", weight: 3 }, { word: "marathon", weight: 3 },
      { word: "sports.yahoo", weight: 6 },
      { word: "体育", weight: 3 }, { word: "运动", weight: 3 }, { word: "健身", weight: 3 },
      { word: "虎扑", weight: 7 }, { word: "懂球帝", weight: 7 }, { word: "Keep", weight: 7 },
      { word: "马拉松", weight: 3 }
    ]
  },
  "健康医疗": {
    keywords: [
      { word: "health", weight: 4 }, { word: "medical", weight: 4 }, { word: "hospital", weight: 4 },
      { word: "doctor", weight: 3 }, { word: "clinic", weight: 3 }, { word: "pharmacy", weight: 4 },
      { word: "medicine", weight: 3 }, { word: "mental", weight: 3 }, { word: "therapy", weight: 3 },
      { word: "wellness", weight: 3 }, { word: "healthcare", weight: 3 },
      { word: "nutrition", weight: 3 }, { word: "surgery", weight: 3 }, { word: "diagnosis", weight: 3 },
      { word: "vaccine", weight: 3 }, { word: "disease", weight: 3 }, { word: "symptom", weight: 2 },
      { word: "健康", weight: 4 }, { word: "医疗", weight: 3 }, { word: "医院", weight: 3 },
      { word: "养生", weight: 3 }, { word: "中医", weight: 4 },
      { word: "webmd", weight: 6 }, { word: "mayoclinic", weight: 6 }, { word: "nih.gov", weight: 7 },
      { word: "who.int", weight: 6 }, { word: "cdc.gov", weight: 6 },
      { word: "丁香园", weight: 7 }, { word: "好大夫", weight: 7 }, { word: "春雨医生", weight: 6 },
      { word: "平安好医生", weight: 6 }
    ]
  },
  "效率工具": {
    keywords: [
      { word: "notion", weight: 8 }, { word: "trello", weight: 7 }, { word: "asana", weight: 7 },
      { word: "jira", weight: 7 }, { word: "confluence", weight: 7 }, { word: "figma", weight: 7 },
      { word: "canva", weight: 7 }, { word: "miro", weight: 7 }, { word: "excalidraw", weight: 7 },
      { word: "draw.io", weight: 7 }, { word: "docs.google", weight: 7 }, { word: "sheets.google", weight: 7 },
      { word: "slides.google", weight: 7 }, { word: "drive.google", weight: 7 }, { word: "dropbox", weight: 7 },
      { word: "onedrive", weight: 7 }, { word: "loom", weight: 6 }, { word: "zoom", weight: 7 },
      { word: "meet.google", weight: 7 }, { word: "teams.microsoft", weight: 7 }, { word: "calendly", weight: 6 },
      { word: "airtable", weight: 7 }, { word: "typeform", weight: 6 }, { word: "zapier", weight: 6 },
      { word: "ifttt", weight: 6 }, { word: "todoist", weight: 7 }, { word: "evernote", weight: 7 },
      { word: "obsidian", weight: 7 }, { word: "roamresearch", weight: 6 },
      { word: "tool", weight: 2 }, { word: "editor", weight: 2 },
      { word: "飞书", weight: 8 }, { word: "钉钉", weight: 7 }, { word: "企业微信", weight: 7 },
      { word: "腾讯文档", weight: 7 }, { word: "石墨文档", weight: 7 }, { word: "语雀", weight: 7 },
      { word: "WPS", weight: 7 }, { word: "幕布", weight: 6 }, { word: "XMind", weight: 6 }
    ]
  },
  "设计与创意": {
    keywords: [
      { word: "dribbble", weight: 8 }, { word: "behance", weight: 8 }, { word: "deviantart", weight: 7 },
      { word: "artstation", weight: 7 }, { word: "unsplash", weight: 7 }, { word: "pexels", weight: 6 },
      { word: "design", weight: 3 }, { word: "creative", weight: 3 }, { word: "艺术", weight: 3 },
      { word: "设计", weight: 3 }, { word: "创意", weight: 3 }, { word: "illustration", weight: 3 },
      { word: "color", weight: 2 }, { word: "font", weight: 2 }, { word: "typography", weight: 3 },
      { word: "palette", weight: 3 }, { word: "ux", weight: 3 }, { word: "ui", weight: 3 },
      { word: "graphic", weight: 3 }, { word: "branding", weight: 3 }, { word: "logo", weight: 3 },
      { word: "sketch", weight: 3 },
      { word: "站酷", weight: 7 }, { word: "花瓣", weight: 7 }, { word: "优设", weight: 6 },
      { word: "涂鸦", weight: 3 }
    ]
  },
  "政府与参考": {
    keywords: [
      { word: ".gov", weight: 8 }, { word: ".gov.cn", weight: 8 }, { word: ".edu", weight: 5 },
      { word: "government", weight: 5 }, { word: "政务", weight: 3 }, { word: "政府", weight: 3 },
      { word: "reference", weight: 3 }, { word: "dictionary", weight: 3 }, { word: "thesaurus", weight: 3 },
      { word: "translation", weight: 3 }, { word: "translate", weight: 3 }, { word: "翻译", weight: 3 },
      { word: "字典", weight: 3 }, { word: "library", weight: 3 }, { word: "图书馆", weight: 3 },
      { word: "法律", weight: 4 }, { word: "法规", weight: 3 },
      { word: "wikipedia", weight: 7 }, { word: "wiktionary", weight: 6 },
      { word: "中国政府网", weight: 7 }, { word: "国家统计局", weight: 6 }
    ]
  },
  "人工智能": {
    keywords: [
      { word: "openai", weight: 10 }, { word: "chatgpt", weight: 10 }, { word: "claude", weight: 9 },
      { word: "anthropic", weight: 9 }, { word: "huggingface", weight: 9 }, { word: "huggingface.co", weight: 9 },
      { word: "kaggle", weight: 8 }, { word: "paperswithcode", weight: 8 },
      { word: "langchain", weight: 8 }, { word: "llama", weight: 8 }, { word: "mistral", weight: 8 },
      { word: "cohere", weight: 7 }, { word: "perplexity", weight: 8 }, { word: "perplexity.ai", weight: 8 },
      { word: "copilot", weight: 7 }, { word: "gemini", weight: 8 },
      { word: "midjourney", weight: 8 }, { word: "stable.diffusion", weight: 8 },
      { word: "civitai", weight: 7 }, { word: "replicate", weight: 7 },
      { word: "gradio", weight: 6 }, { word: "ollama", weight: 7 },
      { word: "ai", weight: 3 }, { word: "artificial.intelligence", weight: 3 },
      { word: "machine.learning", weight: 3 }, { word: "deep.learning", weight: 3 },
      { word: "neural", weight: 3 }, { word: "llm", weight: 4 }, { word: "gpt", weight: 4 },
      { word: "transformer", weight: 3 }, { word: "nlp", weight: 3 },
      { word: "computer.vision", weight: 3 }, { word: "reinforcement.learning", weight: 3 },
      { word: "人工智能", weight: 4 }, { word: "机器学习", weight: 4 }, { word: "深度学习", weight: 3 },
      { word: "大模型", weight: 4 }, { word: "AIGC", weight: 4 }
    ]
  },
  "电子游戏": {
    keywords: [
      { word: "steam", weight: 9 }, { word: "steampowered", weight: 9 },
      { word: "epicgames", weight: 8 }, { word: "itch.io", weight: 7 },
      { word: "roblox", weight: 8 }, { word: "minecraft", weight: 8 },
      { word: "nintendo", weight: 8 }, { word: "playstation", weight: 8 }, { word: "xbox", weight: 8 },
      { word: "ign.com", weight: 7 }, { word: "kotaku", weight: 6 }, { word: "polygon", weight: 6 },
      { word: "eurogamer", weight: 6 }, { word: "gamespot", weight: 7 },
      { word: "gog.com", weight: 7 }, { word: "battle.net", weight: 8 },
      { word: "origin", weight: 7 }, { word: "ubisoft", weight: 7 },
      { word: "game", weight: 2 }, { word: "gaming", weight: 2 },
      { word: "esports", weight: 3 }, { word: "rpg", weight: 2 },
      { word: "fps", weight: 2 }, { word: "mmo", weight: 2 },
      { word: "游戏", weight: 3 }, { word: "电竞", weight: 3 },
      { word: "腾讯游戏", weight: 7 }, { word: "网易游戏", weight: 7 },
      { word: "米哈游", weight: 7 }, { word: "原神", weight: 6 }
    ]
  },
  "阅读与写作": {
    keywords: [
      { word: "goodreads", weight: 8 },
      { word: "substack", weight: 7 }, { word: "medium.com", weight: 7 },
      { word: "wordpress", weight: 6 }, { word: "ghost", weight: 6 },
      { word: "scribd", weight: 6 }, { word: "readwise", weight: 6 },
      { word: "project.gutenberg", weight: 6 },
      { word: "read", weight: 2 }, { word: "reading", weight: 2 },
      { word: "book", weight: 2 }, { word: "books", weight: 2 },
      { word: "write", weight: 2 }, { word: "writing", weight: 2 },
      { word: "novel", weight: 2 }, { word: "fiction", weight: 2 },
      { word: "poem", weight: 2 }, { word: "literature", weight: 3 },
      { word: "publish", weight: 2 }, { word: "publication", weight: 2 },
      { word: "blog", weight: 2 }, { word: "article", weight: 2 },
      { word: "grammar", weight: 2 }, { word: "vocabulary", weight: 2 },
      { word: "阅读", weight: 3 }, { word: "写作", weight: 3 }, { word: "读书", weight: 3 },
      { word: "小说", weight: 2 }, { word: "文学", weight: 3 }, { word: "出版", weight: 2 },
      { word: "起点", weight: 7 }, { word: "晋江", weight: 7 }, { word: "豆瓣读书", weight: 7 }
    ]
  },
  "音频与音乐": {
    keywords: [
      { word: "spotify", weight: 9 }, { word: "applemusic", weight: 8 },
      { word: "soundcloud", weight: 8 }, { word: "bandcamp", weight: 7 },
      { word: "tidal", weight: 6 }, { word: "pandora", weight: 6 },
      { word: "shazam", weight: 6 }, { word: "last.fm", weight: 6 },
      { word: "music", weight: 2 }, { word: "song", weight: 2 }, { word: "album", weight: 2 },
      { word: "concert", weight: 2 }, { word: "podcast", weight: 3 },
      { word: "audio", weight: 2 }, { word: "radio", weight: 2 }, { word: "fm", weight: 2 },
      { word: "lyrics", weight: 2 }, { word: "guitar", weight: 2 }, { word: "piano", weight: 2 },
      { word: "apple.podcasts", weight: 7 }, { word: "pocketcasts", weight: 6 },
      { word: "overcast", weight: 6 }, { word: "audible", weight: 7 },
      { word: "网易云音乐", weight: 8 }, { word: "QQ音乐", weight: 8 },
      { word: "酷狗音乐", weight: 7 }, { word: "虾米音乐", weight: 6 },
      { word: "喜马拉雅", weight: 7 }, { word: "蜻蜓FM", weight: 6 },
      { word: "得到", weight: 6 }, { word: "小宇宙", weight: 6 },
      { word: "播客", weight: 3 }
    ]
  },
  "摄影与图像": {
    keywords: [
      { word: "flickr", weight: 7 }, { word: "500px", weight: 7 },
      { word: "lightroom", weight: 7 }, { word: "adobe", weight: 5 },
      { word: "photoshop", weight: 7 }, { word: "gimp", weight: 6 },
      { word: "affinity", weight: 6 }, { word: "camera", weight: 2 },
      { word: "photography", weight: 3 }, { word: "photo", weight: 2 },
      { word: "image", weight: 2 }, { word: "picture", weight: 2 },
      { word: "gallery", weight: 2 }, { word: "nikon", weight: 5 }, { word: "canon", weight: 5 },
      { word: "sony", weight: 4 }, { word: "fujifilm", weight: 5 }, { word: "leica", weight: 4 },
      { word: "摄影", weight: 3 }, { word: "拍照", weight: 2 }, { word: "相机", weight: 3 },
      { word: "修图", weight: 2 }, { word: "图虫", weight: 6 }, { word: "视觉中国", weight: 6 }
    ]
  },
  "云计算与DevOps": {
    keywords: [
      { word: "aws", weight: 9 }, { word: "amazon.aws", weight: 9 }, { word: "amazonwebservices", weight: 9 },
      { word: "azure", weight: 9 }, { word: "azure.microsoft", weight: 9 },
      { word: "google.cloud", weight: 9 }, { word: "cloud.google", weight: 9 },
      { word: "gcp", weight: 8 }, { word: "alicloud", weight: 8 },
      { word: "digitalocean", weight: 7 }, { word: "linode", weight: 6 },
      { word: "vultr", weight: 6 }, { word: "heroku", weight: 7 }, { word: "netlify", weight: 7 },
      { word: "vercel", weight: 7 }, { word: "cloudflare", weight: 8 },
      { word: "fastly", weight: 6 }, { word: "nginx", weight: 7 },
      { word: "istio", weight: 6 }, { word: "terraform", weight: 7 },
      { word: "ansible", weight: 7 }, { word: "jenkins", weight: 7 },
      { word: "github.actions", weight: 7 }, { word: "gitlab.ci", weight: 7 },
      { word: "circleci", weight: 7 }, { word: "travisci", weight: 6 },
      { word: "prometheus", weight: 6 }, { word: "grafana", weight: 6 },
      { word: "cloud", weight: 3 }, { word: "devops", weight: 3 },
      { word: "deploy", weight: 2 }, { word: "infrastructure", weight: 3 },
      { word: "monitoring", weight: 3 }, { word: "ci/cd", weight: 3 },
      { word: "阿里云", weight: 8 }, { word: "腾讯云", weight: 7 }, { word: "华为云", weight: 7 }
    ]
  },
  "数据库与存储": {
    keywords: [
      { word: "mysql", weight: 8 }, { word: "postgresql", weight: 8 }, { word: "postgres", weight: 8 },
      { word: "mongodb", weight: 8 }, { word: "redis", weight: 8 }, { word: "sqlite", weight: 7 },
      { word: "elasticsearch", weight: 7 }, { word: "cassandra", weight: 6 },
      { word: "dynamodb", weight: 7 }, { word: "firebase", weight: 7 },
      { word: "supabase", weight: 7 }, { word: "cockroachdb", weight: 6 },
      { word: "clickhouse", weight: 6 }, { word: "kafka", weight: 7 }, { word: "rabbitmq", weight: 6 },
      { word: "database", weight: 3 }, { word: "db", weight: 2 },
      { word: "sql", weight: 3 }, { word: "nosql", weight: 3 },
      { word: "storage", weight: 3 }, { word: "backup", weight: 2 }
    ]
  },
  "网络安全": {
    keywords: [
      { word: "owasp", weight: 8 }, { word: "hackthebox", weight: 7 }, { word: "tryhackme", weight: 7 },
      { word: "bugcrowd", weight: 7 }, { word: "hackerone", weight: 7 },
      { word: "virustotal", weight: 7 }, { word: "shodan", weight: 7 },
      { word: "exploit", weight: 4 }, { word: "cve", weight: 5 },
      { word: "penetration.test", weight: 3 },
      { word: "security", weight: 3 }, { word: "hacking", weight: 3 },
      { word: "hacker", weight: 3 }, { word: "vulnerability", weight: 3 },
      { word: "encryption", weight: 3 }, { word: "cryptography", weight: 4 },
      { word: "firewall", weight: 3 }, { word: "malware", weight: 3 },
      { word: "phishing", weight: 3 }, { word: "authentication", weight: 3 },
      { word: "oauth", weight: 3 }, { word: "ssl", weight: 3 }, { word: "tls", weight: 3 },
      { word: "隐私", weight: 3 }, { word: "安全", weight: 3 },
      { word: "奇安信", weight: 6 }, { word: "网络安全", weight: 3 }
    ]
  },
  "求职招聘": {
    keywords: [
      { word: "linkedin", weight: 8 }, { word: "indeed", weight: 7 },
      { word: "glassdoor", weight: 7 }, { word: "monster", weight: 6 },
      { word: "dice", weight: 6 }, { word: "ziprecruiter", weight: 6 },
      { word: "stackoverflow.jobs", weight: 7 },
      { word: "job", weight: 2 }, { word: "jobs", weight: 2 }, { word: "career", weight: 2 },
      { word: "resume", weight: 2 }, { word: "cv", weight: 2 },
      { word: "interview", weight: 2 }, { word: "hire", weight: 2 },
      { word: "recruit", weight: 2 }, { word: "salary", weight: 2 }, { word: "employment", weight: 2 },
      { word: "猎聘", weight: 7 }, { word: "拉勾", weight: 7 },
      { word: "BOSS直聘", weight: 8 }, { word: "智联招聘", weight: 7 },
      { word: "前程无忧", weight: 7 }, { word: "牛客网", weight: 6 },
      { word: "招聘", weight: 3 }, { word: "求职", weight: 3 }, { word: "面试", weight: 2 }
    ]
  },
  "房地产与家居": {
    keywords: [
      { word: "zillow", weight: 7 }, { word: "realtor", weight: 6 },
      { word: "redfin", weight: 6 }, { word: "ikea", weight: 7 }, { word: "ikea.com", weight: 8 },
      { word: "wayfair", weight: 6 }, { word: "houzz", weight: 6 },
      { word: "real.estate", weight: 3 }, { word: "property", weight: 2 },
      { word: "house", weight: 2 }, { word: "home", weight: 2 }, { word: "apartment", weight: 2 },
      { word: "rent", weight: 2 }, { word: "mortgage", weight: 2 }, { word: "interior", weight: 2 },
      { word: "furniture", weight: 2 }, { word: "architecture", weight: 3 },
      { word: "链家", weight: 8 }, { word: "贝壳", weight: 8 }, { word: "自如", weight: 7 },
      { word: "安居客", weight: 7 }, { word: "房天下", weight: 6 },
      { word: "装修", weight: 3 }, { word: "房产", weight: 3 }, { word: "租房", weight: 2 }
    ]
  },
  "汽车与交通": {
    keywords: [
      { word: "tesla", weight: 7 }, { word: "bmw", weight: 6 }, { word: "mercedes", weight: 6 },
      { word: "audi", weight: 6 }, { word: "toyota", weight: 5 }, { word: "honda", weight: 5 },
      { word: "ford", weight: 5 }, { word: "volkswagen", weight: 5 }, { word: "porsche", weight: 5 },
      { word: "car", weight: 2 }, { word: "cars", weight: 2 }, { word: "auto", weight: 2 },
      { word: "vehicle", weight: 2 }, { word: "ev", weight: 3 }, { word: "driving", weight: 2 },
      { word: "transportation", weight: 2 }, { word: "aviation", weight: 3 },
      { word: "汽车之家", weight: 7 }, { word: "懂车帝", weight: 7 },
      { word: "易车", weight: 6 }, { word: "蔚来", weight: 6 },
      { word: "小鹏", weight: 6 }, { word: "理想", weight: 6 },
      { word: "比亚迪", weight: 6 }, { word: "汽车", weight: 3 }
    ]
  },
  "法律与法规": {
    keywords: [
      { word: "law", weight: 3 }, { word: "legal", weight: 3 },
      { word: "attorney", weight: 2 }, { word: "lawyer", weight: 2 },
      { word: "court", weight: 2 }, { word: "judge", weight: 2 },
      { word: "copyright", weight: 3 }, { word: "patent", weight: 3 },
      { word: "trademark", weight: 3 }, { word: "gdpr", weight: 4 },
      { word: "privacy", weight: 3 }, { word: "license", weight: 2 },
      { word: "regulation", weight: 2 }, { word: "compliance", weight: 2 },
      { word: "contract", weight: 2 }, { word: "intellectual.property", weight: 3 },
      { word: "法律", weight: 4 }, { word: "法规", weight: 3 }, { word: "律师", weight: 2 },
      { word: "法院", weight: 2 }, { word: "合同", weight: 2 },
      { word: "知识产权", weight: 3 }
    ]
  },
  "科学探索": {
    keywords: [
      { word: "nasa", weight: 8 }, { word: "spacex", weight: 7 },
      { word: "esa", weight: 6 }, { word: "nature.com", weight: 8 }, { word: "science.org", weight: 8 },
      { word: "nationalgeographic", weight: 7 },
      { word: "scientificamerican", weight: 7 },
      { word: "pnas", weight: 6 }, { word: "cell.com", weight: 7 },
      { word: "astronomy", weight: 3 }, { word: "space", weight: 2 },
      { word: "physics", weight: 3 }, { word: "biology", weight: 3 },
      { word: "chemistry", weight: 3 }, { word: "genetics", weight: 3 },
      { word: "climate", weight: 3 }, { word: "quantum", weight: 3 },
      { word: "science", weight: 3 }, { word: "research", weight: 2 },
      { word: "科学", weight: 3 }, { word: "天文", weight: 3 }, { word: "物理", weight: 3 },
      { word: "生物", weight: 3 }, { word: "化学", weight: 3 },
      { word: "中科院", weight: 6 }, { word: "果壳", weight: 6 }
    ]
  },
  "宠物与动物": {
    keywords: [
      { word: "pet", weight: 2 }, { word: "pets", weight: 2 },
      { word: "dog", weight: 2 }, { word: "cat", weight: 2 },
      { word: "animal", weight: 2 }, { word: "veterinary", weight: 3 },
      { word: "vet", weight: 2 }, { word: "breed", weight: 2 },
      { word: "aquarium", weight: 2 }, { word: "bird", weight: 2 }, { word: "fish", weight: 2 },
      { word: "宠物", weight: 3 }, { word: "狗", weight: 2 }, { word: "猫", weight: 2 },
      { word: "动物", weight: 2 }, { word: "兽医", weight: 2 }
    ]
  },
  "营销与运营": {
    keywords: [
      { word: "seo", weight: 3 }, { word: "sem", weight: 3 },
      { word: "marketing", weight: 3 }, { word: "advertising", weight: 2 },
      { word: "analytics", weight: 3 }, { word: "google.analytics", weight: 7 },
      { word: "google.ads", weight: 6 }, { word: "facebook.ads", weight: 6 },
      { word: "hubspot", weight: 6 }, { word: "salesforce", weight: 7 },
      { word: "mailchimp", weight: 6 }, { word: "sendgrid", weight: 5 },
      { word: "hotjar", weight: 5 },
      { word: "content.marketing", weight: 2 }, { word: "growth", weight: 2 },
      { word: "广告", weight: 2 }, { word: "营销", weight: 3 },
      { word: "运营", weight: 2 }, { word: "推广", weight: 2 }
    ]
  },
  "操作系统": {
    keywords: [
      { word: "linux", weight: 7 }, { word: "ubuntu", weight: 7 }, { word: "debian", weight: 6 },
      { word: "centos", weight: 6 }, { word: "fedora", weight: 5 }, { word: "archlinux", weight: 5 },
      { word: "redhat", weight: 6 }, { word: "alpine", weight: 5 },
      { word: "kernel", weight: 5 }, { word: "windows", weight: 5 },
      { word: "macos", weight: 5 }, { word: "android", weight: 5 }, { word: "ios", weight: 5 },
      { word: "os", weight: 2 }, { word: "driver", weight: 2 },
      { word: "terminal", weight: 2 }, { word: "shell", weight: 2 }, { word: "bash", weight: 2 }
    ]
  },
  "数据与AI资产": {
    keywords: [
      { word: "dataset", weight: 3 }, { word: "kaggle", weight: 7 },
      { word: "data", weight: 2 }, { word: "data.engineering", weight: 2 },
      { word: "etl", weight: 2 }, { word: "pipeline", weight: 2 },
      { word: "data.warehouse", weight: 2 }, { word: "data.lake", weight: 2 },
      { word: "spark", weight: 6 }, { word: "hadoop", weight: 5 },
      { word: "flink", weight: 5 }, { word: "airflow", weight: 6 },
      { word: "dbt", weight: 5 }, { word: "looker", weight: 5 },
      { word: "tableau", weight: 6 }, { word: "powerbi", weight: 6 },
      { word: "数据", weight: 2 }, { word: "大数据", weight: 2 }
    ]
  },
  "企业服务": {
    keywords: [
      { word: "sap", weight: 7 }, { word: "oracle", weight: 7 },
      { word: "workday", weight: 6 }, { word: "servicenow", weight: 6 },
      { word: "splunk", weight: 6 }, { word: "datadog", weight: 6 },
      { word: "newrelic", weight: 6 }, { word: "okta", weight: 6 },
      { word: "erp", weight: 3 }, { word: "crm", weight: 3 },
      { word: "saas", weight: 2 }, { word: "b2b", weight: 2 },
      { word: "enterprise", weight: 2 }, { word: "business", weight: 2 },
      { word: "企业", weight: 2 }, { word: "用友", weight: 6 }, { word: "金蝶", weight: 6 }
    ]
  }
};

// 分类器默认配置
const DEFAULT_CONFIG = {
  confidenceThreshold: 3,
  maxConcurrentFetches: 5,
  fetchTimeout: 5000,
  fetchPageContent: true,
  autoOrganizeOnBookmark: false
};

// ===== 预计算优化结构（模块初始化时构建，大幅减少热路径中的重复计算） =====

// 预归一化的关键词列表：{ wordNorm, weight, category }
const _keywordEntries = [];
// 高权重域名关键词扁平表：{ wordLower, category, score } (weight >= 8)
const _domainKeywords = [];

(function buildLookups() {
  for (const [category, config] of Object.entries(CATEGORIES)) {
    for (const { word, weight } of config.keywords) {
      const normalized = normalizeText(word);
      _keywordEntries.push({ wordNorm: normalized, weight, category });
      if (weight >= 8) {
        _domainKeywords.push({ wordLower: word.toLowerCase(), category, score: weight * 2 });
      }
    }
  }
})();

// 生成缓存 key
function getClassifyCacheKey(url, title) {
  return `${url}|${title || ''}`;
}

// 标准化文本用于匹配
function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase().replace(/[^\w\u4e00-\u9fff\u3400-\u4dbf\/\.\-:@]/g, ' ');
}

// 根据域名直接判断分类（使用预计算的高权重域名表）
function classifyByDomain(hostname) {
  if (!hostname) return null;
  const h = hostname.toLowerCase();
  for (let i = 0; i < _domainKeywords.length; i++) {
    const entry = _domainKeywords[i];
    if (h.includes(entry.wordLower)) {
      return { category: entry.category, score: entry.score };
    }
  }
  return null;
}

// 关键词打分（使用预归一化的关键词，避免重复 normalizeText）
function scoreByKeywords(text, hostname) {
  const normalized = normalizeText(text + ' ' + hostname);
  const scores = {};

  for (let i = 0; i < _keywordEntries.length; i++) {
    const { wordNorm, weight, category } = _keywordEntries[i];
    if (normalized.includes(wordNorm)) {
      scores[category] = (scores[category] || 0) + weight;
    }
  }
  return scores;
}

// 提取页面关键文本内容
function extractPageText(html, url) {
  try {
    let hostname = '';
    try { hostname = new URL(url).hostname; } catch (e) {}

    // 提取 title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // 提取 meta description
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // 提取 meta keywords
    const kwMatch = html.match(/<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']*)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']keywords["']/i);
    const keywords = kwMatch ? kwMatch[1].trim() : '';

    // 提取 og:title, og:description
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i);
    const ogTitle = ogTitleMatch ? ogTitleMatch[1].trim() : '';
    const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i);
    const ogDesc = ogDescMatch ? ogDescMatch[1].trim() : '';

    return [hostname, title, description, keywords, ogTitle, ogDesc].join(' ').trim();
  } catch (e) {
    return '';
  }
}

// 核心分类函数
function classifyBookmark(url, title, pageText) {
  let hostname = '';
  try { hostname = new URL(url).hostname; } catch (e) { hostname = url; }

  // 1. 域名精确匹配
  const domainResult = classifyByDomain(hostname);
  if (domainResult) {
    return { category: domainResult.category, confidence: 'high', score: domainResult.score };
  }

  // 2. 综合文本内容打分
  const fullText = [title, pageText, hostname].filter(Boolean).join(' ');
  const scores = scoreByKeywords(fullText, hostname);

  if (Object.keys(scores).length === 0) {
    const name = domainToCategory(hostname) || '网页';
    return { category: name, confidence: 'low', score: 0 };
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  const confidence = top[1] >= 15 ? 'high' : top[1] >= 8 ? 'medium' : 'low';

  return {
    category: top[0],
    confidence,
    score: top[1],
    scores: Object.fromEntries(sorted.slice(0, 3))
  };
}

// 仅根据 URL 和标题快速分类（不获取网页内容）
function classifyBookmarkFast(url, title) {
  return classifyBookmark(url, title, '');
}

// 从域名提取分类名，确保每个书签都有有意义的归属
function domainToCategory(hostname) {
  if (!hostname) return '网页';
  const name = hostname
    .replace(/^www\d*\./i, '')
    .split('.')[0]
    .replace(/[^a-zA-Z0-9\u4e00-\u9fff_-]/g, '')
    .trim();
  if (!name) return '网页';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// 分类名中英文对照
const CATEGORY_NAMES_EN = {
  "社交与通讯": "Social",
  "新闻与资讯": "News",
  "技术与编程": "Technology",
  "购物与电商": "Shopping",
  "娱乐与视频": "Entertainment",
  "教育学习": "Education",
  "金融理财": "Finance",
  "旅游出行": "Travel",
  "美食烹饪": "Food",
  "体育健身": "Sports",
  "健康医疗": "Health",
  "效率工具": "Productivity",
  "设计与创意": "Design",
  "政府与参考": "Reference",
  "人工智能": "AI",
  "电子游戏": "Gaming",
  "阅读与写作": "Reading",
  "音频与音乐": "Audio",
  "摄影与图像": "Photography",
  "云计算与DevOps": "Cloud",
  "数据库与存储": "Database",
  "网络安全": "Security",
  "求职招聘": "Jobs",
  "房地产与家居": "RealEstate",
  "汽车与交通": "Auto",
  "法律与法规": "Legal",
  "科学探索": "Science",
  "宠物与动物": "Pets",
  "营销与运营": "Marketing",
  "操作系统": "OS",
  "数据与AI资产": "DataPlatform",
  "企业服务": "Enterprise",
};

const CATEGORY_NAMES_FALLBACK = '网页';

export { CATEGORIES, DEFAULT_CONFIG, classifyBookmark, classifyBookmarkFast, extractPageText, normalizeText, getClassifyCacheKey, domainToCategory, classifyByDomain, scoreByKeywords, CATEGORY_NAMES_EN, CATEGORY_NAMES_FALLBACK };
