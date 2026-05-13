# Lovart · KEY V3 Editorial Illustration Brief

**Date**: 2026-05-13
**Goal**: 3 张 editorial illustration, 给 KEY 的 3 份 sample brief 配图. 风格锚定: 19 世纪欧洲 engraving / etching, 黑白单色, 古典严肃.

---

## 整体定位

KEY 是中国第一份 AI-Native 决策顾问刊物, 面向 30-50 岁高知用户. 视觉风格对标:
- **Economist 1843 magazine** (内文插图)
- **The New York Review of Books** (David Levine 名家漫画)
- **Aeon Magazine** (长文配图)
- **古典: Gustav Doré 圣经插图 / William Blake 雕版**

**绝对排除**:
- ❌ Midjourney default 风 (3D / colorful / glossy)
- ❌ flat icon / 现代极简扁平
- ❌ watercolor / pastel / soft gradient
- ❌ cartoon / 拟人化 / Q 版
- ❌ stock photo / 写实摄影感
- ❌ futuristic / sci-fi / cyberpunk

---

## Prompt 关键词组 (推荐用)

```
editorial illustration, black and white engraving, intaglio etching style,
crosshatching technique, 19th century magazine illustration, classical line art,
minimal composition, large negative space, contemplative mood,
serif aesthetic, woodcut texture, intaglio print, no color, monochrome,
fine line work, dignified, restrained, literary, philosophical

NOT: 3D, colorful, vibrant, flat illustration, modern minimalism, cartoon,
watercolor, glossy, photorealistic, futuristic, anime, comic
```

---

## 3 张主题 (按 KEY 三大 framework)

### 1. parent-care (父母养老)
**文件名**: `editorial-parent-care.png` + `.svg` (如可能)

**画面**:
> 一只年轻人的手, 从画面右侧伸入, 轻轻覆盖在一只布满皱纹的老人手背上.
> 两只手在画面中心偏右下, 占整体不超过 40% 面积.
> 上方 60% 是大量留白 (or 极浅的纹理底).
> 老人的手有明显的青筋 / 皱纹 / 戒指 / 老年斑.
> 年轻人的手相对光滑, 但能看出已经成年 (不是孩子).

**情绪**: 沉默, 不舍, 责任感. 不悲伤 (拒绝煽情), 不温馨 (拒绝鸡汤).

**构图**: 16:10, 横版, 主体偏右下
**尺寸**: 1600×1000 PNG, 黑白单色

---

### 2. marriage (婚姻)
**文件名**: `editorial-marriage.png` + `.svg`

**画面**:
> 两把古典木椅, 面对面摆放, 中间一张小圆桌.
> 桌上一盏煤油灯 (类似 19 世纪欧洲), **灯熄了**, 灯罩里能看到一缕烟正在升起.
> 两把椅子都是空的.
> 远景透出一扇窗, 窗外是模糊的暮色 (用细密 hatching 表现).

**情绪**: 静默之后的诚实, 不是分手前的撕扯, 而是"我们停在哪里"的时刻.

**构图**: 16:10, 横版, 主体居中略偏低
**尺寸**: 1600×1000 PNG, 黑白单色

---

### 3. child-education (子女教育)
**文件名**: `editorial-child-education.png` + `.svg`

**画面**:
> 一扇半开的木门, 门是画面左侧 1/3.
> 门外: 一条延伸到远方的小路, 路两旁是树 (engraving 经典处理).
> 门内: 一张书桌, 桌上摊开的书 + 一支钢笔, 桌前是空的椅子背影.
> 整体: 门作为"选择"的隐喻 — 走出去 vs 留下读书.

**情绪**: 选择前的犹豫, 不指向任何一种"对". 拒绝励志, 拒绝"父母期待"叙事.

**构图**: 16:10, 横版
**尺寸**: 1600×1000 PNG, 黑白单色

---

## 通用规范

- **色彩**: 纯黑白 (允许灰阶 hatching), 不允许任何彩色. 黑色为 #111111 (KEY ink), 不是纯 #000.
- **背景**: 透明 (PNG with alpha) 或 KEY paper 色 `#FAF8F3`. 不用纯白 #FFFFFF.
- **纹理**: 必须有 hatching / crosshatching / stippling 的雕版质感, 不能是数字平滑.
- **签名**: 不要加任何水印 / signature / "AI generated" 文字.
- **比例**: 16:10 横版 (1600×1000), 因为要嵌入 brief 文本流, 横版优先.
- **格式**: PNG + (如果可能) 描线 SVG (用于深色模式 / 高分屏).

---

## 集成目标

每张图嵌入 sample brief 顶部, 位于 brief 编号印章下方 + 标题上方, 占满阅读宽度 (max-w-prose-xl ≈ 720px). 在阅读上承担:
1. 视觉锚点 (long-form 长文需要)
2. brand signal (这不是 ChatGPT 输出, 是 KEY 刊物)
3. 情绪定调 (跟 framework 文字呼应, 不喧宾夺主)

---

## 交付目录

把 3 张图放进:

```
design-handoff/DELIVERABLES/KEY/DELIVERABLES/05-visual-density/illustrations/
├── editorial-parent-care.png         (1600×1000, 黑白)
├── editorial-parent-care.svg         (描线版, 如果可能)
├── editorial-marriage.png
├── editorial-marriage.svg
├── editorial-child-education.png
├── editorial-child-education.svg
└── README.md                         ← 写每张图的画面描述 / 用法 / Prompt 留底
```

跟 fleurons/ seals/ marginalia/ 同级. 文件名必须严格按上面写的, 我代码里 import 路径已经按这个写好.

---

## 交付时间

24-48h 内. 如果不满意, 我会给 V1→V2 反馈 (具体到画面元素调整), 不接受"风格全推翻".

---

## 失败模式

❌ 主角是人脸特写 (KEY 不做"用户头像"叙事)
❌ 暖色调 (即使灰阶版也偏暖)
❌ 现代场景 (智能手机 / 笔记本电脑 / 现代家具)
❌ 任何文字 / logo / 数字嵌入图中
❌ 太满 (古典 engraving 的精髓是大量留白)
❌ 太"有意境" (我们要的是冷静的隐喻, 不是诗意美感)

✅ 像 New Yorker 文章插图
✅ 像古籍插图 (西方 17-19 世纪 / 中国清代刻本)
✅ 像 Gustav Doré 但更克制
✅ 大量留白, 主体小, 细节精致
