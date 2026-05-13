# KEY · Design Master Directive · v1

**致 Claude Design**
**日期**: 2026-05-13
**版本**: v1
**协作模式**: 你 ↔ 创始人 (Founder, 中间人) ↔ Claude (技术 lead, 写代码)

---

## SECTION A · 你看到的是什么

### A1. 这份文档的角色

这是 KEY 项目对你的**完整工作指令**. 读完它 + 附带的《KEY Brand Brief v1》PDF, 你就有了开始工作的全部信息. 不需要追问. 如果遇到 PDF 没覆盖的判断, 这份文档的 SECTION B (工作哲学) 给你 default — 你按那个走.

### A2. 项目背景 (60 秒版)

**KEY 是一项 AI-native 决策顾问服务**. 它**不是**: chatbot / 心理咨询 / 人生导师 / SaaS 工具 / 知识付费. 它**是**: 把用户的真实背景, 整理成一份**严肃的私人决策简报** (Private Decision Brief), 帮用户在重大决定之前找到"真正关键的那一点".

- 主 Slogan: **Find the key before you decide.**
- 中文: **决定之前, 先找到关键.**
- 核心交付物: **Private Decision Brief** (私人决策简报)
- 内部架构代号: **LifeOS** (代码里仍用, 不对外)
- 前台品牌: **KEY** (用户看到的)

K-E-Y backronym = **Know the context · Expose the trade-offs · You decide**

### A3. 协作流程

```
Claude (我) → 写 Brief # N → 通过创始人转给你 (Claude Design)
你 → 出 V1 deliverables → 放到 ./DELIVERABLES/01-xxx/ 等目录
创始人 → 通知我 V1 就绪
我 → 读你的 deliverables → 写 V1 反馈到 ./ITERATIONS/01-vN-feedback.md
创始人 → 转给你
你 → 出 V2 / V3 → 定稿
我 → 把定稿 SVG/PNG 集成进代码
```

**关键**: 你**不会**直接跟我说话. 创始人是中间人. 所以你的所有产出必须**自解释**, 不能依赖即时澄清.

### A4. 必读 (3 份, 按重要性排)

1. **《KEY Brand Brief v1》PDF** — 创始人会附给你. 这是品牌底盘. 60% 的设计决策能从这份找答案.
2. **本文档** — 工程优先级 + 文件协议 + 反禁区.
3. **(可选, 想看就看)** `docs/BRAND_BRIEF_V3_KEY.md` — 我在代码侧已经实现到哪一步, 哪些 token 已经设好. 不读不影响你工作.

---

## SECTION B · 工作哲学

### B1. 一句话定位

> **KEY 是 Editorial Intelligence — 不是 dashboard, 不是 AI app. 用户打开它, 应该感觉自己在阅读一份写给自己的严肃私人文件.**

这一句话凌驾于所有其他指令之上. 当你不确定一个设计决定时, 问自己: "这看起来像一份严肃 publication, 还是像一个 SaaS dashboard?"

### B2. KEY 不像这些 (绝对禁区)

```
✗ ChatGPT / Claude.ai / Pi / Replika / Character.AI  (任何 AI app UI)
✗ Notion / Linear / Figma  (任何 productivity tool UI)
✗ 心理咨询 / 玄学 / 算命 App
✗ 知识付费课程 / Newsletter 平台
✗ 传统咨询公司官网 (McKinsey 那种灰头土脸的 PowerPoint 美学)
✗ 中国创业公司常见的"科技感"渐变 / 蓝紫色 / glassmorphism
✗ "成长黑客" 风格 (橙色 CTA / 标题加感叹号 / "限时" badge)
```

### B3. KEY 像这些 (mood, 不抄, 不复刻)

**正面**:
- **The Drift Magazine** (thedriftmag.com) — typography craft, 文学杂志
- **Aperture Magazine** — 黑白摄影, 大尺度图片, 大量留白
- **Cabinet Magazine** — 古典出版物气, 复古但不土
- **Pirate Wires** (Mike Solana) — 严肃但有 edge
- **The New Yorker fiction issue** — 长文排版, 字体经典
- **Penguin Modern Classics** 系列封面 — 极简书封, 一行字一个色块
- **MUBI Notebook** (电影杂志) — 大留白, 暗色调
- **中国 90 年代《读书》《万象》杂志封面** — 中文 publication 经典
- **Hermès / The Row / Aesop** 品牌官网视觉气质 (奢侈但安静, 不喧哗)

**反例 (绝对不像)**:
- ChatGPT / Claude.ai / Pi.ai 任何 UI
- Notion / Linear marketing site
- 36 氪 / 极客公园 / 虎嗅 — 任何中国 tech media
- 知乎 / 即刻 — 任何 social platform
- "AI 创业公司" 模板化 landing (Vercel template 那种)

### B4. 16 条反 SaaS 禁令

```
❌ "立即试用" / "免费 14 天" / "Get Started Free" 按钮
❌ 三档定价网格 (Basic / Pro / Enterprise)
❌ "Trusted by xxx" logo 墙
❌ Testimonial 滚轮
❌ FAQ 折叠列表
❌ Feature comparison table
❌ Bouncy / spring 动效, emoji 装饰
❌ Loading spinner (用"沉吟" / 慢 fade 替代)
❌ Modal popup / cookie banner 突兀样式
❌ Hero banner 用渐变背景
❌ "本月限定" / "限时优惠" 营销话术
❌ 用户头像滚动展示 ("100k+ users")
❌ "Powered by AI" / "AI-Driven" badge
❌ Video autoplay
❌ Confetti animation
❌ "Smart suggestions" 弹窗
```

### B5. 招牌句式 (你写文案 / 标语时用)

可以说:
- "我们先找到真正的关键点."
- "这个决定表面是 X, 实际牵动的是 Y."
- "你还没回答最关键的问题."
- "Decision counsel for the moments that matter."
- "Authored, not generated."

不要说:
- "相信自己" / "你已经很棒了" / "宇宙会给你答案" / "听从内心"
- "Smart" / "Intelligent" / "Powered by AI" / "Powered by..."
- 任何 emoji
- 任何排比句

---

## SECTION C · 视觉系统底盘 (从 KEY Brand Brief v1 提炼)

### C1. 配色 (锁定, 不要建议改)

```
Ink Black     #111111   主文字 / 强调 / wordmark
Paper White   #F7F3EA   主背景 / 大面积底色
Warm Gray     #BDB6AA   次文字 / 分隔线 / 边框
Deep Burgundy #6E1F2A   关键标记 / 印章 / 强调元素 (酒红, 不是大红)
Night Navy    #141923   深色报告封面 / Premium 印刷品
```

**应用规则**:
- 大面积 Paper White, 不要 100% 白
- 文字主用 Ink Black, 副文字用 Warm Gray
- Deep Burgundy 永远是**点缀**, 不是大色块 (用在: 印章 / 数字 / 关键 highlight / 分隔细线)
- Night Navy 只用在: 深色 KEY Brief PDF 封面 / KEY Letter 月信封面 / admin 区
- **禁用**: 蓝紫 AI 渐变 / 鲜艳色 / 任何 saturate > 70% 的颜色

### C2. 字体

**英文 serif** (主用):
- Editorial-grade serif (建议: Lora / Source Serif / Newsreader / GT Sectra / Tiempos)
- 权重: Regular (正文) / Italic (引文) / Bold (标题)
- 不用: 任何 sans 做大字号标题, 任何 display font, 任何手写体

**英文 sans** (辅助):
- Modern grotesque (Inter / IBM Plex Sans / Söhne)
- 仅用于: 顶 nav / 小标签 / mono-style 标识 / 大写小标题
- 字距: 大写时 tracking 至少 +100 (类似 publication masthead)

**中文 serif** (主用):
- 思源宋体 Source Han Serif SC, Regular / Bold
- **不用**: 思源宋体特殊重量 (太花) / 楷书 (除点缀场合) / 任何手写体

**中文 sans** (辅助):
- 思源黑体 Source Han Sans SC, Regular / Light
- 仅用于: 小标签 / footer / 行政信息

**字号阶梯** (代码已实现):
```
editorial-xl  3.5rem   封面主标题
editorial-lg  2.5rem   section 主标题
editorial     1.875rem section 子标题
reading       1.0625rem 主阅读体 (line-height 1.75)
```

### C3. Logo / Wordmark 设计原则

**必须**:
1. **全部大写**: `KEY` (不能是 `Key` / `key` / `KeyAI` / `KeyOS` / `KeyPoint`)
2. **字距宽**: 类似 publication masthead, tracking ≈ +0.15em
3. **重量感**: Bold 但不臃肿, 字 stroke 中粗
4. **可选: Y 的细节**: Y 可以**轻微**分叉 (像路径 / fork), 但**绝对不要**让 Y 变成图标
5. **可选: key mark**: 一个独立的小标识, 用 dash / dot / 切口暗示"关键点", 不要画钥匙

**绝对不要**:
- ❌ 画钥匙图标 (太直白, 像密码管理器)
- ❌ Y 用箭头 / 锁 / 任何具象元素
- ❌ 字母用 cyber/digital 字体
- ❌ Gradient / shadow / 任何花哨效果
- ❌ 让 KEY 看起来像首字母缩写 (e.g. K.E.Y. 加点)

**3 个核心场景**:
- **顶 nav** (小尺寸): 简洁版, 只 wordmark, 无 mark
- **海报 / 封面** (大尺寸): 含 mark 版本, 字距更宽
- **Favicon / app icon** (极小): 只用 mark, 或单字 "K"

### C4. 关键 micro-typography 规则

- 中文行宽: 28-42 字 / 行 (publication 标准)
- 英文行宽: 60-75 字符
- 段落间距: 1.5-2 倍行高
- 标点: 中文全角, 英文 smart quotes ("") + em dash (—)
- 数字: 老式数字 (old-style figures) 适合年份 / 编号
- 大写英文: 字距 (tracking) +100 至 +300
- 引文 / blockquote: 永远用 italic + 暗红左侧细竖线
- 章节编号: 罗马数字 I / II / III, 不用阿拉伯数字
- Drop cap (首字下沉) 慎用 — 仅在 manifesto / 长 essay 开篇

---

## SECTION D · 4 个优先级的完整交付清单

### D · P0 — 视觉基础 (本周必出)

这是其他所有工作的前置依赖. 我会在你出完 P0 后, 立刻整合进代码, 整站换皮.

#### **Brief 01 · KEY Wordmark** ⭐

详细 brief 见 `./BRIEFS/01-key-wordmark.md`.

交付清单:
```
01-key-wordmark/
  ├── key-wordmark-primary.svg          主版本, 大写, 字距宽
  ├── key-wordmark-with-mark.svg        含 key mark 小符号
  ├── key-wordmark-on-dark.svg          反相版 (用在 night navy 底)
  ├── key-wordmark-monochrome.svg       纯黑无 mark (印刷用)
  ├── key-mark-only.svg                 小标识独立 (favicon / app icon)
  ├── key-favicon-32.png                32×32 favicon
  ├── key-favicon-180.png               180×180 apple-touch-icon
  ├── key-og-image.png                  1200×630 og:image (社交分享)
  └── README.md                         设计决策 + 使用场景
```

V1 期望: 3 个备选 (3 种字体方向 / 3 种字距处理), 不是同一版本改 3 次.

#### **Brief 02 · Color Palette 验证 + 应用规范**

详细 brief: `./BRIEFS/02-color-palette.md`.

交付清单:
```
02-color-palette/
  ├── palette.json                      { ink: "#111111", paper: ...} 我直接 import
  ├── palette-swatches.pdf              视觉色板 + 文字 sample 在每色上的可读性测试
  ├── palette-usage-guide.pdf           "哪个色用在哪里" 的应用规范
  └── README.md
```

特殊任务: 验证 PDF brief 里 5 个色码视觉上是否一致 / 协调. 如果有微调建议 (e.g. Warm Gray 偏冷 5%), 在 README.md 说明你的判断, **不要直接改色码** — 由创始人 + 我决定是否采纳.

#### **Brief 03 · Typography Spec Sheet**

详细 brief: `./BRIEFS/03-typography.md`.

交付清单:
```
03-typography/
  ├── typography-spec.pdf               完整字号 / 行高 / 字距规范 (英文 + 中文)
  ├── typography-samples.pdf            从 hero 到 caption 全部字号的样例
  ├── font-pairing-recommendations.md   你建议的具体字体组合 (英文 + 中文)
  └── README.md
```

任务: 在 KEY Brand Brief v1 第 12 节"字体方向"基础上, 给出**具体字体推荐**. 必须考虑:
- 商用授权 (Google Fonts 优先, 商用免费)
- 中英文 visual weight 匹配 (思源宋体 + Lora 是否真的匹配, 还是需要换)
- 简体中文显示 (有些英文 serif 配中文显示效果差)

#### **Brief 04 · Internal Demo Poster**

详细 brief: `./BRIEFS/04-internal-poster.md`.

交付清单:
```
04-internal-poster/
  ├── poster-A2-cn.pdf                  中文主版 (A2)
  ├── poster-A2-en.pdf                  英文副版
  ├── poster-bilingual-840x594.pdf      中英双联展示
  ├── poster-digital-preview.png        数字传阅版
  ├── poster-source-file.afpub          (or .indd / .ai) 源文件
  └── README.md
```

用途: 创始人内部 demo 给媒体老同行看. 这是 KEY 品牌的第一份对外物料, 必须**审美级别极高**.

具体文案 + 设计规格我在 brief 04 里详写.

---

### D · P1 — 页面 Polish (下周, P0 完成后)

每个页面交付:
1. **现状评估**: 你访问当前部署 (URL 创始人会给), 5-10 条问题 / 改进点
2. **Visual mockup**: 像素级精确的目标版本 (PNG @ 2x)
3. **组件 spec sheet**: 那个页面 top 5 关键组件的 micro-spec (字号 / 留白 / 状态 / hover)

**页面列表**:

```
05. Brief 05 — 封面 /
06. Brief 06 — 方法论 /methodology
07. Brief 07 — 样品 /sample-brief (含 BriefRenderer 组件)
08. Brief 08 — 会员 /membership
09. Brief 09 — 透明度 /transparency
10. Brief 10 — 加入 /invite
11. Brief 11 — Onboarding /onboarding (4 步建档)
12. Brief 12 — 产品入口 /pulse (内测用户的"今日") — 注: 这是产品页, 不是 publication 页, 风格略不同
13. Brief 13 — Admin 后台 (黑底白字工具风, 不需要 publication-grade, 但配色字体保留)
```

每个 brief 我会在 P0 完成后陆续放出. **你不要自己启动 P1, 等我的具体 brief**.

---

### D · P2 — 输出物模板 (第三周)

```
14. Brief 14 — KEY Brief PDF 模板
    用途: 用户的私人决策简报可导出为 PDF, 像一份印刷品
    规格: A4 vertical, 多页 (cover + 9 sections + appendix)
    必须含: 封面页 (briefNumber + topic + 撰稿日期) / 章节扉页 / 印章 / 落款

15. Brief 15 — KEY Letter PDF 模板
    用途: V2 Premium 会员月度长信
    规格: A5 vertical, 8-12 页
    气质: 比 Brief 更"信件感", 暗示是写给单一收信人

16. Brief 16 — KEY Archive 年度纪念册模板
    用途: 创始会员每年收到一本印刷装订的纪念册
    规格: A5 horizontal, 32-48 页, 含全部 12 月 brief 节选 + 年度索引
```

---

### D · P3 — 推广物料 (上线前)

```
17. Brief 17 — 第一份公开 marketing 海报 (1-2 variants)
    用途: 公开发布时社媒 / 邮件签名 / 印刷
    跟 P0-04 内部 demo 不同: 这份对外卖, 更克制, 更"邀请"

18. Brief 18 — 邮件视觉系统
    Welcome / KEY Brief 推送 / KEY Review 周送 / Outcome 30/90/365 提醒
    每种邮件: header 视觉 + 字体规范 + 落款印章

19. Brief 19 — 社交媒体模板套件
    微信公众号封面 (4 比 3) / 即刻分享卡片 / 小红书首图 (3 比 4)
    每种 1 个主模板 + 3 个变体

20. Brief 20 — 投资人 deck 视觉系统 (V2, 不紧急)
    封面 / 内页 / 数据图表 / 团队页 等的视觉规范
```

---

## SECTION E · 工作流和文件协议

### E1. 目录结构 (创始人本机已建好)

```
~/Projects/life-os/design-handoff/

├── 00-MASTER-DIRECTIVE.md            ← 本文件
├── BRIEFS/                            ← 我写的具体设计指令
│   ├── 01-key-wordmark.md
│   ├── 02-color-palette.md
│   ├── 03-typography.md
│   ├── 04-internal-poster.md
│   └── ... (后续陆续放)
│
├── DELIVERABLES/                      ← 你的输出放这里
│   ├── 01-key-wordmark/
│   │   ├── ...
│   │   └── README.md
│   ├── 02-color-palette/
│   └── ...
│
└── ITERATIONS/                        ← 反馈往返
    ├── 01-wordmark-v1-feedback.md
    └── ...
```

### E2. 文件命名规范

```
✓ key-wordmark-primary.svg              kebab-case, lowercase, 描述性
✓ key-brief-pdf-cover-v2.pdf            含 v 数字标识迭代版本
✓ palette-swatches-final.pdf            final 标识定稿
✗ KEY Wordmark Final V2 (1).svg        大小写混乱, 空格, 括号
```

### E3. 每份 deliverable 必含 README.md

模板:

```markdown
# Brief 01 · KEY Wordmark · Deliverable v1

## 文件清单
- key-wordmark-primary.svg — 主 wordmark, RGB ink black
- ...

## 设计决策 (3-5 句)
- 字体选了 X 因为 Y
- 字距 +180 因为想要 publication masthead 感
- Y 的分叉做了 12% 偏移, 暗示路径但不形成图标
- ...

## 使用场景
- ✓ 顶 nav (高度 24-32px)
- ✓ 邮件 header
- ✓ 印刷 (300dpi 以上)
- ✗ 不要在 favicon 用 wordmark, 用 key-mark-only

## 不可改动的部分
- 字距锁定 +0.15em
- KEY 三字母不可分开 / 拆字 / 加点

## V1 → V2 期待反馈
- [你预期我会反馈的 1-3 个点]
```

### E4. 反馈流程

**V1 出 → 我评估 → 写反馈 markdown → 创始人转给你 → V2 → 定稿**

我的反馈格式:

```markdown
# Brief 01 · V1 Feedback

## 选择
保留 V1-A (3 个备选里这个)

## 必须改 (P0)
1. 字距 +0.15em 改 +0.18em, 因为在 nav 24px 高度下偏窄
2. Y 分叉太明显, 减到 8%
3. on-dark 版本 Paper White 用 #F7F3EA 在 #141923 上对比度不够, 改 #FAF7F2

## 建议改 (P1)
1. key-mark-only.svg 太复杂, 简化到 1-2 stroke
2. ...

## 不要动 (V1 已对的部分)
1. 字体选 [X] 是对的, 保留
2. ...

## V2 期望
- 1 个最终 primary + 已知细节修订
- 不要再 explore 新方向
```

预计迭代次数: P0 每 brief 2-3 轮 / P1 每 brief 1-2 轮 / P2-P3 视复杂度.

### E5. 不要做的事 (协作纪律)

```
✗ 不要给我提"创新方向"建议 — 品牌方向已定, KEY Brand Brief v1 是底盘
✗ 不要超出 brief 范围 (e.g. 我让你做 wordmark, 不要顺手做 logo animation)
✗ 不要在 V1 给 10 个方案 — 给 3 个真有差异化的备选
✗ 不要把"美" 凌驾于"对" 之上 — 当你的审美直觉跟 brief 冲突时, brief 赢
✗ 不要在 README.md 里写营销话术 — 写设计决策, 不写"这个 logo 体现了 KEY 的清晰与力量"
```

---

## SECTION F · 启动指令

### F1. 本周 (Week 1) 必出

```
□ Brief 01 · KEY Wordmark — V1 出 3 个备选, 配 README
□ Brief 02 · Color Palette — V1 出 palette.json + swatches PDF
□ Brief 03 · Typography Spec — V1 出字体推荐 + spec PDF
□ Brief 04 · Internal Demo Poster — V1 出中英双版 PDF
```

预计你的时间: 8-12 小时 (4 个 brief V1).

### F2. 怎么开始

1. **读** `00-MASTER-DIRECTIVE.md` (本文件) 全文
2. **读** 《KEY Brand Brief v1》PDF 全文
3. **读** `BRIEFS/01-key-wordmark.md` (第一个 brief 详细)
4. **开始 Brief 01** — wordmark 是其他所有视觉的前置依赖
5. **同时启动** Brief 02-04 (它们之间相对独立)
6. **出 V1** → 放到 DELIVERABLES/[NN-xxx]/ → 通知创始人

### F3. 找不到答案时的兜底

当你遇到 brief 没说清楚的判断:

1. **first check**: KEY Brand Brief v1 PDF 里有没有
2. **second check**: 本文件 SECTION B (工作哲学) 给的 default 是什么
3. **third check**: 类比一份高端 publication (The Drift / Aperture / Penguin Modern Classics) 会怎么做
4. **fourth check (兜底)**: 选最克制的那个选项 — KEY 的品牌核心是 "**不糊弄**" (来自 KEY Brand Brief 第 8 节), 克制永远不错.

### F4. 一句话总结

> **你不是在做一个 AI 产品的 UI. 你是在为"中国第一份 AI 原生决策顾问刊物" 设计视觉系统. 当你不确定的时候, 想这一句.**

---

## 附录: 重要联系人 / 路径

- **创始人 (中间人)**: [创始人名] — 所有交付和反馈通过他
- **代码集成方 (我)**: Claude (技术 lead) — 我会读你的 SVG/PNG/PDF, 集成进代码
- **目录基址**: `~/Projects/life-os/design-handoff/`
- **代码 repo**: `~/Projects/life-os/` (你不需要进, 我处理)
- **当前部署 URL**: (创始人会给) — 你 P1 阶段访问做现状评估

---

**Version log**:
- v1 (2026-05-13): 初版, 基于 KEY Brand Brief v1 PDF 编写

请确认你已读完本文档 + KEY Brand Brief v1 PDF, 然后开始 Brief 01.

— Claude (技术 lead) · 通过创始人转达
