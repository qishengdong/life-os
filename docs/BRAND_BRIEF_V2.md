# Brand Brief v2

> 项目代号 **LifeOS** · 正式品牌名待定 (候选: Kairos / Vantage / 其他)
> 文档版本: v2 · 2026-05-12 · 状态: working draft, 不对外

---

## 0. 一句话定位 (官网 / pitch / 媒体稿都用这句)

> **LifeOS 是一项决策顾问服务. 我们以软件的边际成本, 交付私人顾问级的人生决策结果 — 装在一份你愿意每天打开的杂志级阅读体验里.**

英文版:

> **LifeOS is decision counsel — delivered with the margins of software, the rigor of a private consultant, and the craft of a serious publication.**

---

## 1. 产品宪法 (6 条, 不可违反)

```
1. Services-as-Software, not Software-as-Service.
   我们卖结果, 不卖功能. 每个用户都得到顾问级交付物.

2. The output must feel authored, not generated.
   交付物像被人写出来的, 不是被机器生成出来的.

3. Publication-grade craft is the deliverable, not the wrapper.
   出版物级 craft 是产品质量本身, 不是营销包装.

4. Year retainer, not monthly SaaS.
   按年付费. 不做月订. 不做 freemium 主推.

5. B2C must sell identity-level relationship, not tools.
   用户买的是"我有一个长期决策档案", 不是"我能用一个 AI".

6. Founder-independent, founder-credentialed.
   创始人背景是产品质量的暗证, 不是 dependency.
```

每一个 PR / 视觉决策 / 文案决策都对照这 6 条审.

---

## 2. 目标用户 (锐化版)

**核心**: 30-50 岁, 中国大陆, 受过良好教育, 在以下五类决策中至少一类正卡住:

1. 父母养老 / 代际责任
2. 孩子教育路径 / 升学方向
3. 婚姻关系 (修复 / 分居 / 离婚)
4. 职业转身 (跳槽 / 创业 / 转型 / 早退休)
5. 迁移决策 (城市 / 国家 / 阶层)

**画像**:
- 家庭可支配资产 ≥ 500 万 RMB
- 至少一份高强度工作 / 创业身份
- 文化资本 ≥ 经济资本 (买得起但更在意 craft)
- 对 ChatGPT 类通用 AI 试过, 失望过, 但仍相信 AI 的潜力
- 读过《单读》《读库》《财新》《纽约客》中至少一本

**反向**:
- 不卖给 18-30 学生 / 初入职场年轻人 (他们的决策不在我们 5 类里)
- 不卖给 60+ 长者 (UI 不友好, 调性不匹配)
- 不卖给"AI 信仰者" / "效率工具收藏家" (他们要看不上我们的速度)

---

## 3. 调性坐标

```
              克制 / 知性
                  ↑
                  │
《单读》●     ●《读库》
                  │
《纽约客》●   ● LifeOS   ← 我们的位置
                  │
              ●《财新》
   Robb Report ●
                  │
                  └──────────────→  奢华 / 高端
```

我们的位置: **比《单读》多一档稀缺感 / 比 Robb Report 少一档物质感**.

---

## 4. 语言原则

### 一定做
- 名词比形容词重要 ("一种逃避" > "你在逃避")
- 句号制造节奏 ("父母老了. 你也老了. 他们的时间, 比你想的快.")
- 偶尔独立成段的短句作为重锤
- 中英对照时不直译, 各自有 craft

### 一定不做
- 不用 "你好 / 你已经很棒了 / 加油 / 相信自己 / 听从内心"
- 不用 emoji
- 不用排比句式
- 不用 "首先 / 其次 / 综上所述 / 希望对你有帮助" 这些 LLM 套话
- 不用 "亲爱的 / 宝贝 / 家人们" 这些 KOC 用语
- 不用 "智能 / 一键 / 极速 / 智慧 / AI 赋能" 这些 SaaS 套话

### 招牌句式
- "你不需要再多一个 AI 助手. 你需要一个长期记得你的决策伙伴."
- "有些决定, 不能冲动, 不能外包, 也不能只靠安慰."
- "像被写出来的 — 不是被生成出来的."
- "陪你想清楚 · 看清代价 · 长期记得你."

---

## 5. 视觉系统

### 5.1 颜色
```
背景         #FAF7F2   暖白纸
主文字       #3A2E26   深棕
副文字       #6F6258   中性灰墨
强调 / 印章   #9B2D27   暗红
注脚         #999999   浅灰
状态成功     #5C8576   sage
状态警示     #B8843C   amber
状态危险     #A8442F   ember
```
**禁用**: 任何鲜艳色 / 渐变 / 透明叠加 / glassmorphism

### 5.2 字体
| 用途 | 字体 | 来源 |
|---|---|---|
| 中文 serif | 思源宋体 Source Han Serif SC | Adobe / Google Fonts |
| 英文 serif | Lora | Google Fonts |
| 中文 sans | 思源黑体 Source Han Sans SC | Adobe / Google Fonts |
| 英文 sans | Inter | Google Fonts |
| 数字 / 代码 | SF Mono / Menlo | 系统 |

**禁用**: 任何 display font / 手写体 / 字形花哨字体

### 5.3 字号阶梯 (Tailwind tokens 已生效)
```
editorial-xl    3.5rem    封面主标题
editorial-lg    2.5rem    section 主标题
editorial       1.875rem  section 子标题
reading         1.0625rem 主阅读体 (line-height 1.75)
```

### 5.4 留白
- Section 之间最小 120-200px
- Hero 区域最小 200px 上下 padding
- 内容列宽: 中文 28-32 字 / 英文 65-75 字符

### 5.5 动效
- 全部不超 600ms
- 缓动用 `ease-out`, 不用 `bounce` / `elastic`
- 不用 spring physics
- 翻页 / loading 用"沉吟"隐喻 (慢 fade-in), 不用 spinner

### 5.6 图像
- 黑白 + 颗粒 + 暗调
- 不用 stock photo / midjourney 通用人脸
- 主图位置: 每页最多 1 张, 不堆砌
- 用人物背影 / 静物 / 单一物的特写, 不用正面笑脸

---

## 6. 反 SaaS 设计禁令 (16 条)

```
❌ "立即试用" / "免费 14 天" / "Get Started Free" 按钮
❌ 3 档定价网格 (Basic / Pro / Enterprise)
❌ "Trusted by xxx" logo 墙
❌ Testimonial 滚轮
❌ FAQ 折叠列表
❌ Feature comparison table
❌ Bouncy emoji 装饰
❌ Loading spinner (改成"沉吟"隐喻)
❌ Modal popup / cookie banner 突兀样式
❌ Hero banner 用渐变背景
❌ "本月限定" / "限时优惠" 营销话术
❌ 用户头像滚动展示 ("100k+ users")
❌ "Powered by AI" / "AI-Driven" badge
❌ Video autoplay
❌ Confetti animation
❌ "Smart suggestions" 弹窗
```

---

## 7. 模块命名 taxonomy ([BRAND] 待替换)

```
[BRAND] Brief       私人决策简报 (核心交付物)
[BRAND] Pulse       每日信号 (Daily Pulse)
[BRAND] Review      周末复盘 (Weekly / Monthly Review)
[BRAND] Ledger      决策账本 (Outcome Ledger)
[BRAND] Archive     卷宗 (Brain)
[BRAND] Board       私人董事会 (V2 多角色推演, 后期)
[BRAND] Letter      月度长信 (V2 编辑视角, 后期)
```

**关键**: 不再叫 "Daily Pulse"/"Sunday Review"/"Decision" — 而是 "[BRAND] Pulse"/"[BRAND] Review"/"[BRAND] Brief". 每个交付物都打 [BRAND] 标识, 加强身份感.

---

## 8. Hero Copy 三版 (中英双语)

### 版本 A — 行为契约范式 (借 CLAUDE.md 共识)
```
中文:
我们没让 AI 变聪明.
我们给 AI 写了一份决策契约 —
让它不再附和你, 不再跳过关键问题.

EN:
We didn't make AI smarter.
We wrote AI a decision contract —
so it won't agree with you, won't skip what matters.
```

### 版本 B — 直接对比范式 (最 brutal)
```
中文:
ChatGPT 不记得你三个月前说过什么.
Pi 不记得你. Claude 不记得你.
Replika 假装记得你, 但只挑你爱听的.

我们记得 — 而且会用你三个月前那句话当面问你.

EN:
ChatGPT doesn't remember what you said three months ago.
Pi doesn't. Claude doesn't.
Replika pretends to, but only with what you want to hear.

We remember. And we'll ask you about it — in your own words.
```

### 版本 C — Manifesto 范式 (用作长文 / 海报)
```
中文:
有些决定, 不能冲动, 不能外包, 也不能只靠安慰.

父母养老. 孩子出路. 婚姻去留.
职业转身. 要不要迁移.

我们把这些决定, 整理成一份
像被写出来的 — 不是被生成出来的
私人简报.

EN:
Some decisions can't be made on impulse.
Can't be outsourced. Can't be soothed away.

Aging parents. A child's path. A marriage.
A career turn. Whether to move.

We turn these decisions into a private brief —
authored, not generated.
```

---

## 9. 定价 (锁定)

| 等级 | 定价 | 承诺交付 |
|---|---|---|
| **观察者** (邀请制) | 30 天 ¥0 | 完整体验, 30 天后必须升级或停 |
| **年度会员** | ¥1988/年 | 365 天无限决策简报 + 月度 Review + Outcome 30/90/365 回访 |
| **创始会员** (限 100 名, 一次性) | ¥4988/3 年 | 上述 + 编号纪念 brief 集 (年度精装 PDF) + 每年 1 次创始人匿名问答 |

**没有月订. 没有 freemium 主推. 第一周不合适, 全退.**

定价 anchor:
> "请一位资深顾问按小时聊重大决定: ¥1000-3000/小时.
> 走一遍完整 12 维分析 + 365 天跟踪: 至少 ¥50,000.
> LifeOS 一年: ¥1988."

---

## 10. 监管 / 合规底线

- **不是医疗诊断**: 涉医必转介医生
- **不是法律咨询**: 涉法必转介律师
- **不是投资建议**: 涉具体标的必转介财务顾问
- **不是心理咨询**: 涉自伤必给热线
- 所有输出底部自动追加 "AI 生成" 声明
- 主动声明这些边界 = trust signal, 不是免责声明

---

## 11. 创始人角色 (founder-light)

```
做:
- 创始人是 "Founder", 不是 "CEO"
- /manifesto 里有创始人宣言, 但内容侧重产品哲学不侧重个人故事
- 创始人对外发声仅在: 创刊号 manifesto / 媒体专访 (≤ 4 次/年) / 创始会员年度问答 (1 次/年)

不做:
- 不做创始人 IP 节目 / 不开公众号 / 不做日更
- 不在产品里出现"创始人寄语" / "Founder's pick"
- 创始人传媒背景不在首屏出现 — 让产品质量本身证明
```

---

## 12. 命名最终待办

```
[ ] 确定品牌正式名 (Kairos / Vantage / 第三选项)
[ ] 域名注册 .com / .ai / .cn (品牌名定后立即)
[ ] 商标注册第 9 类 (软件) + 第 42 类 (技术服务) + 第 41 类 (出版)
[ ] 全 codebase 批量替换 [BRAND] placeholder
[ ] 微信公众号 / 视频号主体注册 (V2 微信渠道需要)
```

---

## 附录 A · 视觉参考 (mood board)

**正面**:
- The Drift Magazine — typography craft
- Aperture Magazine 1990s — 静物美学
- Cabinet Magazine — 古典出版感
- MUBI Notebook — 大留白
- The New Yorker fiction issue — 长文排版
- Pirate Wires (Mike Solana) — 严肃但有 edge
- 三联生活周刊 90 年代封面 — 中文出版物经典
- Penguin Modern Classics — 极简书封

**反面 (绝对不像)**:
- ChatGPT / Claude / Pi / Character.AI 任何 UI
- Notion / Linear / Figma marketing site
- 任何 AI 创业公司 landing page
- 任何"成长黑客"博客
- 任何"自我提升"公众号

---

## 附录 B · 文档版本

- v1 (2026-05-11): 初稿, "AI-Native Magazine" framing, 已废
- v2 (2026-05-12): 切换为 Services-as-Software framing, publication-grade craft 作为交付层
- v3 (待): 定名后, 替换 [BRAND] + 加 logo guidelines + 物料模板

---

*这份文档不对外. 内部决策依据.*
