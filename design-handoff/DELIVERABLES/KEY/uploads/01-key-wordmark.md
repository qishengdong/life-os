# Brief 01 · KEY Wordmark

**Priority**: P0
**Week**: 1
**Estimated time**: 3-5 hours for V1
**Iterations expected**: 2-3 rounds before final

---

## 用途

KEY 品牌的 wordmark 是**整个视觉系统的基石**. 它会出现在:

- 网站顶 nav (~16-24px 高)
- 网站 footer (~18-24px 高)
- 邮件 header
- 海报 / 印刷品 (任意大小)
- favicon (16-32px)
- Apple touch icon (180px)
- OG image (1200×630)
- 投资人 deck 封面

所以它必须: 极小看得清, 极大不土气, 中性可适配所有底色.

---

## 受众感知目标

30-50 高知用户第一次看到 KEY wordmark 时, 应该立刻感觉:

```
✓ 像一本严肃刊物的 masthead
✓ 像一份私人事务所的徽记
✓ 安静, 有重量, 有审美

✗ 不像 AI 创业公司
✗ 不像 SaaS logo
✗ 不像密码管理器 (没有钥匙图标!)
```

---

## 设计原则

### 必须做到 (从 KEY Brand Brief v1 第 13 节)

1. **全部大写**: `KEY`. 三个字母. 不加点, 不分开.
2. **字距宽**: tracking ≈ +0.12-0.18em, 类似 publication masthead (参考: VOGUE / THE NEW YORKER / FRIEZE 的标题字距)
3. **重量感**: 字 stroke 中粗到粗 (相当于 Bold weight). 不要细弱.
4. **可识别极小尺寸**: 16px 高时仍清晰可读

### 可选探索

1. **Y 的微处理**: Y 可以**轻微**做成分叉路径 (path / fork 的暗示), 但偏移幅度 ≤ 12%. 绝对不要让 Y 变成图标.
2. **Key mark 小符号**: 一个独立的、极简的标识, 可以是:
   - 一根短横线 (—)
   - 一个 small dot (·)
   - 一个 V 形切口 (∧)
   - 一个 colon-like 双点 (∶)
   不要画钥匙形状, 不要画锁形状.

### 绝对不要

- ❌ 画钥匙图标 / 锁图标 / 任何 lock-related 符号
- ❌ Y 用箭头 / 路标 / 任何具象元素
- ❌ Cyber / digital / monospace 字体
- ❌ Gradient / shadow / 3D / outline 效果
- ❌ K.E.Y. 中间加点
- ❌ 把 KEY 放在 box / circle / pill 容器里
- ❌ 给 KEY 加副标题 (e.g. "KEY · AI" 这种)
- ❌ 让 KEY 看起来像首字母缩写

---

## 字体方向 (建议, 你可以反驳)

**英文 serif headline 候选**:
- **GT Sectra** (Grilli Type, 付费) — 我的首选, contemporary serif with editorial gravitas
- **Tiempos Headline** (Klim) — Wallpaper magazine 用过, 极有 publication 感
- **Source Serif Pro** (Adobe Open Source) — 免费, 现代但有重量
- **Newsreader** (Production Type, 免费) — 收缩版的 newspaper serif, 适合 wordmark
- **EB Garamond** — 经典, 古典, 但可能太"古书"
- **Playfair Display** — 太常见, 不要用

**如果走 sans-serif 方向** (我个人不建议, 但你可以备一版):
- **Söhne** (Klim, 付费)
- **Inter Display** (免费)
- **IBM Plex Sans** (免费)

**你的任务**: 给出 3 个 wordmark 备选, **不是同一字体改 3 次**, 而是**3 个真有差异化的方向**:

- **备选 A**: 经典 serif 路线 (e.g. GT Sectra)
- **备选 B**: 现代 serif 但更收敛 (e.g. Newsreader, 字 stroke 略细一点)
- **备选 C**: 你的 wildcard 方向 (e.g. 你认为更对的某种处理)

---

## 视觉参考 (mood, 不抄)

**找这种感觉**:
- VOGUE 杂志封面顶部的 logo treatment
- THE NEW YORKER 的 masthead
- The Drift Magazine 封面
- THE PARIS REVIEW
- Aperture 杂志的 wordmark
- FRIEZE 艺术杂志
- 中国 90 年代《读书》《万象》的封面字

**绝对不像**:
- ChatGPT / Claude.ai / Pi 的 logo
- Notion / Linear / Figma 的 logo
- 任何 "K" 开头的 fintech / crypto 项目 logo

---

## 交付清单

放到 `DELIVERABLES/01-key-wordmark/`:

### V1 (本周)

```
# 3 个备选方向, 每个含 5-6 个文件
key-wordmark-A-primary.svg              主版本 (A 方向)
key-wordmark-A-with-mark.svg            含 key mark 小符号
key-wordmark-A-on-dark.svg              反相版 (用在 #141923 / #6E1F2A 底色)
key-wordmark-A-monochrome.svg           纯黑无 mark
key-wordmark-A-preview.png              大尺寸 preview, 2400px wide

key-wordmark-B-primary.svg
key-wordmark-B-with-mark.svg
key-wordmark-B-on-dark.svg
key-wordmark-B-monochrome.svg
key-wordmark-B-preview.png

key-wordmark-C-primary.svg
key-wordmark-C-with-mark.svg
key-wordmark-C-on-dark.svg
key-wordmark-C-monochrome.svg
key-wordmark-C-preview.png

README.md                                设计决策, 3 个备选差异说明
```

### V2 (定稿后, 我会指定保留哪个)

```
# 选定方向的完整变体集
key-wordmark-primary.svg                 选定版 (替代 A/B/C)
key-wordmark-with-mark.svg
key-wordmark-on-dark.svg
key-wordmark-monochrome.svg
key-mark-only.svg                        小标识独立 (用于 favicon)
key-favicon-16.png                       16×16
key-favicon-32.png                       32×32
key-favicon-180.png                      180×180 (apple-touch-icon)
key-og-image.png                         1200×630 (社交分享卡)

README.md
```

---

## 技术规格

**SVG 要求**:
- viewBox 基准: 1024 × 256 (4:1 长宽比, primary wordmark) / 256 × 256 (mark only / favicon)
- 字体: 转 outline (不依赖 font file)
- 颜色: 使用 CSS variables 或 inline hex
- 文字: 含 `<title>KEY</title>` for accessibility
- 路径: 优化, 不超过 5KB / file

**PNG 要求**:
- 透明背景
- @1x / @2x / @3x 三档
- preview 用 PNG 1200px wide for clarity

**颜色** (4 个版本对应):
```
primary           Paper White 底, Ink Black 字     #F7F3EA / #111111
on-dark           Night Navy 底, Paper White 字   #141923 / #F7F3EA
monochrome        透明底, Ink Black 字              transparent / #111111
with-mark         Paper White 底, Ink Black 字 + Deep Burgundy mark   #F7F3EA / #111111 / #6E1F2A
```

---

## V1 README.md 必含 (你写)

```markdown
# Brief 01 · KEY Wordmark · V1

## 3 个方向的核心差异
- A: [一句话]
- B: [一句话]
- C: [一句话]

## 每个方向的设计决策
### A
- 字体: [选了什么, 为什么]
- 字距: [数值, 为什么]
- Y 处理: [做了什么, 为什么]
- key mark: [设计成什么, 为什么]

### B / C 同上

## 我的推荐
[你的判断 — 哪个方向最对, 为什么]

## 已知 trade-off
[每个方向的弱点]

## V2 期望
[你预期我会反馈什么]
```

---

## 反馈预期 (V1 → V2 → V3)

**V1 → V2** (我的反馈):
- 选定 1 个方向 (A/B/C 之一)
- 标注 2-3 个 micro 调整 (字距 / Y 处理 / mark 大小)
- 期望 V2 给出 1 个最终 primary + 4 个标准变体

**V2 → V3** (定稿前):
- 极细微调整 (e.g. 像素级 baseline / spacing)
- 出完整 favicon 套件 + og-image

预计 V3 即为定稿. 极少情况下需要 V4.

---

## 一句话总结

**KEY 的 wordmark 应该让 30-50 高知用户**在 0.5 秒内识别出这是一份"严肃出版物级"的品牌, 而不是又一个 AI 创业公司. 当你不确定的时候, 想象这个 wordmark 印在一本你愿意从书店带走的杂志封面上.

— Claude (技术 lead), 通过创始人转达
