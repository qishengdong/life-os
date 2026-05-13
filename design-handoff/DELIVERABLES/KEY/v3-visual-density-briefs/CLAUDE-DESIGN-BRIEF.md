# Claude Design · KEY V3 Visual Density Brief

**Date**: 2026-05-13
**Phase**: V3 — Publication-grade visual density
**Goal**: KEY 是严肃 publication, 不是 SaaS. 加视觉密度但不背离 "Economist / NY Review of Books / Aeon" 古典出版物定位.

---

## 整体语境

KEY 已经有的视觉资产:
- 6 个 wordmark variant (`/public/brand/key-wordmark*.svg`)
- 5 核心 palette: paper #FAF8F3 / ink #111 / burgundy #7C2330 (seal) / warmGray / navy
- typography: Source Serif 4 (en) + Noto Serif SC (cn) + JetBrains Mono (numbers)
- mark-only 印章已用在 4 个页 footer

**绝对排除**: SaaS 风 / 3D illustration / flat icon / colorful gradient / 现代极简扁平.

**风格锚定参考**: Economist 1843 magazine / Monocle / NY Review of Books / 古典中文出版物 (《读书》《万象》).

---

## A. Fleuron Set (章节分隔)

### 用途
替代 KEY 各页 `<hr>` / 章节之间的纯横线. 当前我们用的是 `h-px w-16 bg-seal-500/60` 一条短横线 — 太通用. 需要 5 个 fleuron variant 让设计师 / 编辑选用.

### 规格
- **格式**: SVG, viewBox `0 0 64 16`, inline-safe
- **颜色**: 单色 `#111111` (黑) + 备一份 `#7C2330` (seal red) variant
- **线条粗细**: 0.5pt-1pt, 古典印刷质感
- **居中对齐**, 上下留 ~2px 空白

### 5 个 variant
1. **fleuron-classical-west.svg** — 西式古典 fleuron, 卷草纹 + 中心对称, 类似 ❧ 但更精致
2. **fleuron-chinese-huiwen.svg** — 中式回纹, 几何方形扁平, 上下两条短线 + 中间小回字
3. **fleuron-key-derived.svg** — 从 KEY mark 衍生 (复用 `key-mark-only.svg` 的笔法), 三笔分立 (K / E / Y 抽象化)
4. **fleuron-simple-diamond.svg** — 简约: 中心一个菱形 ◆ + 两侧短横, 极简但不普通
5. **fleuron-double-rule.svg** — 双线: 上下两条平行细线 + 中间空, 古典报纸常用

### 文件命名
```
fleuron-classical-west.svg
fleuron-classical-west-seal.svg   ← burgundy variant
fleuron-chinese-huiwen.svg
fleuron-chinese-huiwen-seal.svg
fleuron-key-derived.svg
fleuron-key-derived-seal.svg
fleuron-simple-diamond.svg
fleuron-simple-diamond-seal.svg
fleuron-double-rule.svg
fleuron-double-rule-seal.svg
```

---

## B. Brief 编号印章 (重要 — KEY 独有视觉符号)

### 用途
每份 brief 右上角盖一个红章, 像编辑部"已审核 / 已发布"的印记. 这是 KEY 跟通用 AI 输出最直观的区分 — 你的 ChatGPT 输出没有印章, KEY brief 有.

### 规格
- **格式**: SVG, viewBox `0 0 240 240`, 透明背景
- **主色**: `#7C2330` (KEY seal burgundy)
- **风格**: 古典 wax seal × 中文官印融合 (不是橡皮章卡通, 是 17 世纪欧洲蜡封 × 清代官方印章质感)
- **质感**: 边缘略不规则 (像盖印按压不均), 内部纹饰清晰
- **可读性**: 在 paper (#FAF8F3) 背景上印章必须清晰可读

### 3 个 variant (圆 / 方 / 八角)

#### 1. `brief-seal-round.svg` (主用)
- 圆形外圈双线 (外粗内细)
- 中心大字 `KB` (Source Serif 4 Bold, 仿衬线印章字)
- 上半环形小字 `KEY EDITORIAL OFFICE`
- 下半环形小字 `BRIEF · 中国`
- 中间分隔: 上下两个小五角星 / 卷草饰

#### 2. `brief-seal-square.svg`
- 方形外框双线
- 中心 4 个字 `KEY` (篆体感, 但仍可读)
- 四角小回纹装饰
- 致敬中国传统印章

#### 3. `brief-seal-octagon.svg`
- 八角形外框
- 中心 `KB · 编辑部`
- 八角填小波浪纹
- 西式 wax seal 致敬

### 应用规范
- 默认尺寸: 80×80px
- 透明度: 90% (让 paper 纹理透出, 不死黑)
- 微旋转: 集成时 CSS `rotate(-3deg ~ +3deg)` 随机
- 位置: brief 右上角, top: 24, right: 24

### 文件命名
```
brief-seal-round.svg     ← 主, 必出
brief-seal-square.svg
brief-seal-octagon.svg
```

---

## C. Marginalia Ornament (边距装饰)

### 用途
Sample brief / methodology 长文阅读时, 左右边距加细线条 ornament, 让页面像"编辑批改过的样张", 不是干净的网页. 致敬古典印刷书籍的 marginalia.

### 规格
- **格式**: SVG, 全部单色 `#111111`, 半透明 (opacity 0.4)
- **线条**: 0.5pt 细线, 印刷感
- **viewBox**: 因元素而异, 见下

### 6-8 个 ornament

1. **section-start-line.svg** (32×4) — 章节起始: 一条短横线 + 末端小圆点
2. **section-end-line.svg** (32×4) — 章节结束: 中心一个细十字 + 两侧短横
3. **quote-bracket-left.svg** (8×80) — 引用左侧装饰: 古典直角钩
4. **quote-bracket-right.svg** (8×80) — 引用右侧装饰: 镜像
5. **paragraph-divider.svg** (24×12) — 段落分隔: 三个垂直小点 (like ⋮ 但精致)
6. **interrogation-mark.svg** (24×24) — "拷问"标记: 一个非常细的 ⊙ 内含古典感叹号
7. **footnote-marker.svg** (12×12) — 脚注标记: † 或 ‡ 古典版
8. **page-break-fleuron.svg** (200×16) — 完整跨页装饰横线 + 中心 fleuron

### 文件命名
```
marginalia/section-start-line.svg
marginalia/section-end-line.svg
marginalia/quote-bracket-left.svg
marginalia/quote-bracket-right.svg
marginalia/paragraph-divider.svg
marginalia/interrogation-mark.svg
marginalia/footnote-marker.svg
marginalia/page-break-fleuron.svg
```

---

## 交付目录结构

```
design-handoff/DELIVERABLES/KEY/v3-visual-density-briefs/
└── deliverables/
    ├── fleurons/
    │   ├── fleuron-classical-west.svg
    │   ├── fleuron-classical-west-seal.svg
    │   ├── ... (10 SVG)
    │   └── README.md  ← 解释每个 variant 何时用
    ├── seals/
    │   ├── brief-seal-round.svg     (主)
    │   ├── brief-seal-square.svg
    │   ├── brief-seal-octagon.svg
    │   └── README.md
    └── marginalia/
        ├── section-start-line.svg
        ├── ... (8 SVG)
        └── README.md
```

---

## 交付时间

- **First pass**: 24h 内 — fleuron 全 10 个 + brief-seal-round (主) + marginalia 4 个 (1, 3, 4, 5)
- **Second pass**: 48h 内 — 剩余 marginalia + seal square / octagon

---

## 反馈/修改约定

- 我会在 first pass 后给 V1→V2 反馈 (md 文件), 24h 内
- 任何 variant 不确定, 都做 — 我可以选 / 删
- 单色 SVG 务必保证 `fill="#111111"` 或 `fill="#7C2330"` 是顶层 attribute, 便于代码统一 swap 颜色
- 不要嵌入 `<text>` (字体依赖), 文字都 outline 化

---

## 失败模式 (帮助你判断)

❌ 像 Substack 暖色 illustrative
❌ 像 Notion 现代极简扁平
❌ 像 Tailwind UI / shadcn pattern
❌ 任何 emoji / cartoon / 3D / colorful gradient
❌ 印章卡通化 (Q 版 / 童趣)

✅ 像 Economist 1843 magazine 内页装饰
✅ 像 NY Review of Books 段落装饰
✅ 像清代刻本古籍的回纹边框
✅ 严肃, 克制, 古典, 但不沉闷
