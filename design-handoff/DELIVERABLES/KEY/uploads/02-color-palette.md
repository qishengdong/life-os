# Brief 02 · Color Palette 验证 + 应用规范

**Priority**: P0
**Week**: 1
**Estimated time**: 2-3 hours
**Iterations expected**: 1-2 rounds

---

## 用途

KEY Brand Brief v1 第 12 节定了 5 个色码. 这份 brief 让你做两件事:

1. **验证**: 这 5 个色码在真实使用场景下视觉是否一致 / 协调 / 可读
2. **规范**: 写一份明确的"哪个色用在哪里"的应用指南, 防止后续 marketing / 印刷 / 合作方滥用

---

## 从 KEY Brand Brief v1 锁定的 5 色

```
Ink Black     #111111   主文字 / 强调
Paper White   #F7F3EA   主背景 / 大面积底色
Warm Gray     #BDB6AA   次文字 / 分隔线
Deep Burgundy #6E1F2A   关键标记 / 印章
Night Navy    #141923   深色封面 / Premium 印刷品
```

**这 5 个色是锁定的**. 你不要建议替换. 如果你认为某个色有问题, 在 README.md 里说理由 + 调整建议, 但**输出的 palette.json 仍用原色码** — 由创始人 + 我决定是否改.

---

## 任务清单

### 任务 A: palette.json 生成

```json
{
  "core": {
    "ink": "#111111",
    "paper": "#F7F3EA",
    "warmGray": "#BDB6AA",
    "burgundy": "#6E1F2A",
    "navy": "#141923"
  },
  "scale": {
    "ink": {
      "900": "#111111",
      "700": "#2A2622",
      "500": "#5A554F",
      "400": "#7A7570",
      "300": "#9F9B95"
    },
    "paper": {
      "100": "#FAF8F2",
      "200": "#F7F3EA",
      "300": "#EFEAE0",
      "400": "#E2DCD0",
      "500": "#D6CFC2"
    },
    "burgundy": {
      "500": "#6E1F2A",
      "400": "#8A2F3B",
      "600": "#561822",
      "tintBg": "#F5E8E9"
    }
  },
  "semantic": {
    "textPrimary": "#111111",
    "textSecondary": "#5A554F",
    "textTertiary": "#7A7570",
    "background": "#F7F3EA",
    "backgroundSecondary": "#FAF8F2",
    "accent": "#6E1F2A",
    "border": "#E2DCD0",
    "borderEmphasis": "#BDB6AA",
    "darkSurface": "#141923"
  }
}
```

**你的任务**:
- 在 `core` 5 色基础上, 派生 `scale` (深浅档) 和 `semantic` (语义化命名)
- 上面是我的草稿, 你**优化具体派生色码** (e.g. ink-700 应该多深, 你的色觉判断)
- 验证: ink-900 / paper-200 / burgundy-500 三色在标准 reading 场景下对比度足够 (WCAG AA)

### 任务 B: palette-swatches.pdf 制作

视觉色板, 一份 PDF (A4 vertical 或 A3 vertical). 内容:

**Page 1: Core 5 色**
- 每色一个大色块 (200×200mm), 标注:
  - 色名 (Ink Black)
  - HEX (#111111)
  - RGB (17, 17, 17)
  - CMYK (印刷用)
  - Pantone 接近值 (可选)

**Page 2: 每色的可读性测试**
- 在每个 core 色背景上, 用其他色做文字 sample
- 标注哪些组合 OK, 哪些不行 (用 ✓ ✗)
- 示例:
  ```
  Paper bg + Ink text         ✓ (主用)
  Paper bg + Burgundy text    ✓ (强调用)
  Paper bg + Warm Gray text   ✓ (次文字)
  Paper bg + Navy text        ✗ (对比度勉强, 不建议)
  Navy bg + Paper text        ✓ (deep cover 用)
  ```

**Page 3: 应用场景示例**
- 模拟 4 个真实场景的色彩应用:
  1. 网站首页 hero (Paper bg + Ink text + 1 burgundy accent line)
  2. KEY Brief 内页 (Paper bg, Ink section, Burgundy 罗马数字 + 印章)
  3. KEY Brief PDF cover (Navy bg, Paper white text + Burgundy seal)
  4. 邮件 header (Paper bg, Ink wordmark, Warm Gray 副标题)

### 任务 C: palette-usage-guide.pdf

文字版规范 (5-8 页), 明确写:

**何时用 Ink Black (#111111)**:
- 主标题, 副标题, body text
- Wordmark
- 关键 callout
- 不用于: 大面积色块 (会压抑)

**何时用 Paper White (#F7F3EA)**:
- 整站主背景
- 大面积留白区
- 印刷品页面底色
- 不用于: 反相场景, 应该用 #FAF8F2 (Paper 100, 更亮)

**何时用 Warm Gray (#BDB6AA)**:
- 次文字 (e.g. 时间戳 / footer 信息)
- 分隔线 (0.5pt)
- 边框 (cards 边框)
- 不用于: 主文字 (对比度不够)

**何时用 Deep Burgundy (#6E1F2A)**:
- 关键标记: 罗马数字 / 编号 / 印章
- 分隔细线 (0.5pt) 在重要 section 间
- 强调引文的左侧 border
- 印章 / stamp 视觉
- "important" status indicators
- 不用于: 大面积色块 / hero 背景 / CTA 按钮底色

**何时用 Night Navy (#141923)**:
- KEY Brief PDF 封面
- KEY Letter 月信封面
- Admin 后台背景
- 投资人 deck 深色页
- 不用于: 网站任何公开页 (公开页保持 Paper)

**绝对禁止**:
- ❌ 5 色之外的任何颜色 (除非是 status: success #5C8576, warning #B8843C, danger #A8442F — 已在代码 token 里)
- ❌ Gradient
- ❌ 透明叠加 (低于 95% opacity)
- ❌ 蓝紫 AI 色 (#5B6EF5 / #7B68EE 等)
- ❌ Glassmorphism (frosted glass)

---

## 交付清单

放到 `DELIVERABLES/02-color-palette/`:

```
palette.json                   完整 token (core + scale + semantic)
palette-swatches.pdf           视觉色板 (3 页)
palette-usage-guide.pdf        应用规范 (5-8 页)
palette-source-file.afpub      (or .indd / .ai) 源文件
README.md
```

---

## V1 README.md 必含

```markdown
# Brief 02 · Color Palette · V1

## 我对 5 个 core 色的判断
- Ink Black #111111: [你的判断]
- Paper White #F7F3EA: [你的判断]
- ...

## 如果让我建议微调 (但 V1 不实际改色码)
- [如果 Warm Gray 偏冷可以暖 5% / 如果 Burgundy 在小尺寸印刷会发紫等]
- (这些是 advisory, 等创始人 + Claude 决定)

## 派生色我的逻辑
- ink scale 5 档: 我用 hue rotation + lightness 控制, 不是简单的 alpha
- paper scale: 比 Brand Brief 给的 #F7F3EA 略亮和略暗两档, 用于卡片层次
- burgundy 我选择 tint bg (#F5E8E9) 作为可选 "强调区背景"

## 对 WCAG 的考虑
- ink-900 on paper-200: 对比度 14.5:1 ✓ AAA
- ink-500 on paper-200: 对比度 7.2:1 ✓ AA
- burgundy on paper-200: 对比度 8.1:1 ✓ AA
- warm-gray on paper-200: 对比度 2.8:1 ✗ — 仅用 12pt+ 且非主文字
```

---

## 反馈预期 (V1 → V2)

**V1 → V2**:
- 我可能调整 1-2 个派生色 (e.g. ink-500 偏暖一点)
- 我可能要求新增一个色 (e.g. quaternary 文字色)
- 我可能调整某个 semantic 命名

预计 V2 即为定稿.

---

## 一句话总结

**KEY 的 5 色不是花俏的"品牌色系", 是一份严肃 publication 的印刷规范**. 你的工作是把它从 5 个孤立色码, 变成一份**真实可用的工程级 token 系统 + 应用规范**.

— Claude (技术 lead), 通过创始人转达
