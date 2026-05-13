# BRAND_BRIEF v3 · KEY

> **代码侧 single source of truth**. 跟 `KEY Brand Brief v1.pdf` (创始人提供) + `design-handoff/00-MASTER-DIRECTIVE.md` (给 Claude Design) 三份文档咬合.
>
> 这一份的角色: **工程实现决策**. PDF 是品牌底盘, master directive 是设计协作, 这份是我 (Claude 技术 lead) 怎么把这两件事翻译进代码.
>
> 文档版本: v3 · 2026-05-13 · 替换 v2 (LifeOS framing)

---

## 0. 一句话锁定

> **KEY 是 AI-native 决策顾问服务. 内部架构 = LifeOS. 用户看到的品牌 = KEY. 核心交付物 = Private Decision Brief.**

代码里:
- 任何**面向用户**的字符串 → `KEY`
- 任何**内部架构 / 代码注释 / 文档**里的 → `LifeOS` (架构名保留)
- 数据库表 / API 路径 / 内部模块名保留 LifeOS terminology (不重构, 仅前台改名)

---

## 1. KEY = K · E · Y

```
K   Know the context        长期记忆 / 5 层 Memory / RMC / Brain
E   Expose the trade-offs   7 条契约 / 12 维分析 / PreMortem / Inspector
Y   You decide              反鸡汤宪法 / "不替你决定" 产品宪法第 5 条
```

这个 backronym 不是营销, 是**产品宪法的压缩**.

它会出现在:
- `/methodology` 页 — 7 条契约重组成 K-E-Y 三大支柱
- `/sample-brief` 页 — Brief 内部结构呼应 K-E-Y
- `/membership` 页 — 价值主张
- 海报 / 印刷品 / 投资人材料
- Brief 内部章节排序 (K 在前, E 中间, Y 收尾)

---

## 2. Slogan 三层体系

| 层 | 英文 | 中文 | 用途 |
|---|---|---|---|
| **主** | Find the key before you decide. | 决定之前, 先找到关键. | Hero / 海报 / 第一眼 |
| **方法论** | Know the context. Expose the trade-offs. You decide. | 理解背景, 揭示代价, 决定仍属于你. | About / Methodology / Deck |
| **Brief 内部** | Key question. Evidence. Your call. | 关键问题, 真实证据, 最终判断. | 每份 KEY Brief 开头 |

---

## 3. 副 Slogan / 场景化短语

| 场景 | 文案 |
|---|---|
| 首页 hero 第二段 | "有些决定, 不能冲动, 不能外包, 也不能一个人硬扛." |
| 产品解释 (会员 / 定价) | "Private decision briefs for life's hardest choices." / "为人生最难的选择, 生成你的私人决策简报." |
| 投资人 / About | "AI-native decision counsel, delivered as private briefs." |
| 高级品牌句 (海报 / 登录页底部) | "The answer is rarely the point. Find the key." / "答案往往不是重点, 关键才是." |
| 公众号 / 即刻传播 | "你缺的不是更多建议, 是一个真正的关键点." |

---

## 4. 模块命名 (锁定)

代码内部用 LifeOS 名 (`decision_briefs` 表 / `briefPipeline` 函数 / 等), 但**用户看到的全部用 KEY 名**:

| 旧 (LifeOS era) | 新 (KEY 用户可见) | 中文 |
|---|---|---|
| Decision Brief | **KEY Brief** | 私人决策简报 |
| Daily Pulse | **KEY Pulse** | 每日信号 |
| Sunday / Weekly Review | **KEY Review** | 周/月复盘 |
| Outcome Ledger | **KEY Ledger** | 决策账本 |
| Brain / RMC | **KEY Archive** | 人生档案 |
| (V2) Multi-role decision | **KEY Board** | 私人董事会 |
| (V2) Monthly long-form | **KEY Letter** | 月度长信 |

**Brief number 前缀**: `LB-` → `KB-` (KEY Brief).

---

## 5. 视觉系统 — Code-level tokens

### 5.1 颜色 (Tailwind config 已升级)

```javascript
// 新 KEY 5 色 core
ink:          '#111111',   // 主文字 / 强调
paper:        '#F7F3EA',   // 主背景
warmGray:     '#BDB6AA',   // 次文字 / 边框
burgundy:     '#6E1F2A',   // 关键标记 / 印章 / accent
navy:         '#141923',   // 深色 cover / Admin

// 旧 token 暂保留 (向后兼容, V3.5 移除)
seal: 旧暗红 #9B2D27 → 仍可用, 但 burgundy 是新主色
ink (old): 深棕 #3A2E26 → 仍可用, 但 ink (new) #111111 是新主色

// 状态色 (跟 v2 一致, 不变)
sage:  '#5C8576'    // success
amber: '#B8843C'    // warning  
ember: '#A8442F'    // danger
```

### 5.2 字体 (跟 v2 一致, 等 Brief 03 final)

- 中文 serif: 思源宋体 SC (Noto Serif SC, Google Fonts)
- 英文 serif: Lora (Google Fonts, 等 Brief 03 可能升级到 GT Sectra / Tiempos / Newsreader)
- 中文 sans: 思源黑体 SC
- 英文 sans: Inter

### 5.3 Wordmark 用法 (代码层)

```tsx
// 顶 nav 标准写法
<Link href="/" className="font-serif text-xl font-semibold tracking-tightish text-ink-900">
  KEY
</Link>

// Hero 大标题写法
<h1 className="font-serif text-editorial-xl text-ink-900 tracking-tighter">
  KEY
</h1>

// Footer 标准写法
<p className="font-serif text-base text-ink-900">
  KEY Editorial Office
</p>
```

**等 Brief 01 wordmark SVG 出来后**, 替换文字版 KEY 为 SVG 组件 (`<KeyWordmark />`).

### 5.4 印章 (KEY mark)

每份 KEY Brief 右下角的圆形印章, 当前是 CSS 画的圆 + KB-XXX 文字. 等 Brief 01 出 SVG mark, 改用真正的 SVG.

---

## 6. 产品宪法 (锁定 + 新加 KEY 条款)

跟 v2 的 6 条对齐, 新增 KEY backronym 作为 Section 7:

```
1. Services-as-Software, not Software-as-Service.
2. The output must feel authored, not generated.
3. Publication-grade craft is the deliverable, not the wrapper.
4. Year retainer, not monthly SaaS.
5. B2C must sell identity-level relationship, not tools.
6. Founder-independent, founder-credentialed.
7. KEY = Know the context. Expose the trade-offs. You decide.
   (品牌哲学压缩进 backronym, 不是营销, 是产品三件事的本来面目)
```

---

## 7. 实施 checklist (代码侧, 我做)

### Phase 0 (今天) ✓
- [x] `docs/BRAND_BRIEF_V3_KEY.md` (本文件)
- [x] `design-handoff/` 目录骨架
- [x] `design-handoff/00-MASTER-DIRECTIVE.md` (给 Claude Design)
- [x] `design-handoff/BRIEFS/01-04` (P0 4 份 brief)
- [ ] Tailwind config 加 KEY 5 色 token (新增, 不删旧)

### Phase 1 (本周)
- [ ] 全代码 "LifeOS" user-facing → "KEY" 批量替换
  - 包括: `/` `/methodology` `/sample-brief` `/membership` `/transparency` `/invite` `/admin` `/onboarding`
  - 不动: lib/* 内部代码注释 / 数据库表名 / API 路径 / 内部文档
- [ ] 模块名 user-facing 改 KEY 前缀:
  - Decision Brief → KEY Brief
  - Daily Pulse → KEY Pulse  
  - Weekly Review → KEY Review
  - Outcome Ledger → KEY Ledger
  - Brain → KEY Archive
- [ ] Brief number 前缀 `LB-` → `KB-`
- [ ] `/methodology` 重排: 7 条契约组进 K-E-Y 三大支柱
- [ ] Email templates 全部 KEY 化
- [ ] AI disclosure footer: "LifeOS Editorial Office" → "KEY Editorial Office"

### Phase 2 (下周 — 接收 P0 deliverables)
- [ ] 集成 KEY wordmark SVG (Brief 01 V2 定稿后)
- [ ] 集成 palette.json (Brief 02)
- [ ] 集成 typography spec (Brief 03)
- [ ] 海报印刷品交付 (Brief 04)
- [ ] favicon / og-image 替换
- [ ] 启动 Brief 05-13 (页面 polish)

### Phase 3 (上线前 — Brief 14-20)
- [ ] KEY Brief PDF 导出功能
- [ ] KEY Letter PDF (V2)
- [ ] 邮件视觉系统
- [ ] 公开 marketing 海报
- [ ] 真 SMTP + 真域名 + 部署

---

## 8. 跟 Claude Design 协作的同步机制

```
我 (Claude 技术 lead)
   ├── 写 brief # N → design-handoff/BRIEFS/NN-xxx.md
   ↓
创始人 (中间人)
   ├── 把 brief md + KEY Brand Brief v1 PDF 转给 Claude Design
   ↓
Claude Design
   ├── 出 V1 → 放 design-handoff/DELIVERABLES/NN-xxx/ + README.md
   ↓
创始人 (通知我)
   ↓
我
   ├── 读 deliverables → 写反馈 design-handoff/ITERATIONS/NN-vM-feedback.md
   ↓
创始人转给 Claude Design
   ↓
Claude Design 出 V2 → 循环 → 定稿
   ↓
我集成进代码
```

---

## 9. 版本日志

- **v1** (2026-05-11, 已废): 早期 "AI-Native Magazine" framing
- **v2** (2026-05-12, 已废): "Services-as-Software + publication-grade craft" framing, 仍用 LifeOS 名
- **v3** (2026-05-13, 当前): KEY 品牌锁定, LifeOS 降为内部架构名, K-E-Y backronym 加入产品宪法
