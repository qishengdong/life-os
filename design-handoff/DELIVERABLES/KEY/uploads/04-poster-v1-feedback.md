# Brief 04 · Internal Demo Poster · V1 → V2 Feedback

**Date**: 2026-05-13
**Reviewer**: Claude (technical lead) via founder
**Verdict**: V1 排版扎实. Direction A confirmed. 6 个调整 — 其中 EN method 文案我反 README 的推荐.

---

## 整体评价

你做的事 V1 已经实现 80%:
- 6 段垂直 rhythm 合理 (280 / 140 / 720 / 440 / 200 / 120 = 1900px + margin)
- 五句 manifesto 句号节奏 (`父母养老。孩子出路。婚姻去留。职业转身。要不要迁移。`) 保住了
- 印章用 `feTurbulence` 模拟墨渍, 跟 EN 版的 clean stamp 形成"print-shop pair" — 这个**concept 我特别欣赏**, 留着.
- Honest placeholder 比假图重要, 你这个判断专业.

下面按你 README 末尾 6 个问题逐一答.

---

## 1. Image direction — **confirm A (still life)**

不变. 静物方向跟产品调性最咬合.

V2 photograph 落地后, 你 README 说的 "gradient panel 变 `<img>`, № I centerpiece 移除" 流程合理. 一行替换.

## 2. Photograph art direction (V2 commission 用) — 4 条具体指引

如果创始人或我们要找摄影师, 你 (designer) 应该写 photographer brief. V2 同步出. 我先给 4 条具体方向:

a. **Props 清单**:
   - 钢笔 1 支 (Mont Blanc Meisterstück 经典款, 或 Pelikan M800, 或 Sailor 长刀研) — 不能是 fountain pen 之外的笔, 不能是 Pilot G2 这种平价笔
   - 折角 A4 稿纸一沓 (浅米色, 不是雪白)
   - 半喝的茶 (中式青花杯 or 极简白瓷, 不能是马克杯)
   - 台灯局部 (黄铜或胡桃木底座, 不是 IKEA 现代款)
   - **不出现**: 手机 / 电脑 / 屏幕 / 任何 modern tech

b. **光线**:
   - 单一暖色光源, 从画面右上 45° 照下
   - 高光集中在钢笔 + 茶杯, 其余区暗调
   - 没有自然光 (避免"日间办公室" 错觉)

c. **构图**:
   - 桌面占 70%, 上方留 30% 暗调空气
   - 物件不对称排布 (左 1/3 是钢笔 + 纸, 右 2/3 是台灯 + 茶 + 空气)
   - 物件之间留出 negative space, 不密集堆放

d. **后期**:
   - 黑白 + 颗粒 (Tri-X 风格)
   - 暗部不发蓝 (排除数字感)
   - 高光不过曝 (保留质感)

## 3. Manifesto 三行折行 — **KEEP**

```
我们把这些决定，整理成一份
像被写出来的 — 不是被生成出来的
私人决策简报。
```

V1 这个三行 break 是对的:
- 第 1 行 setup (用 declaration)
- 第 2 行 distinction (用 em-dash 制造停顿)
- 第 3 行 punchline (`私人决策简报。` 独立成行 = 重锤)

**不要 collapse 成两行**. 节奏会丢.

**不要让它 natural wrap**. 三个 line breaks 是 craft, 不是排版结果.

## 4. EN method K-E-Y 文案 — **反对 README 推荐**

你 README 用的是温和版:
```
K   Know the context.       We remember who you are.
E   Expose the trade-offs.  We surface the costs you can't unsee.
Y   You decide.             The call remains yours.
```

我推荐用 brief 原版的**更锋利版**:
```
K   Know the context.       We remember what you said. We don't ask twice.
E   Expose the trade-offs.  We surface what you're avoiding.
Y   You decide.             The call is yours. We won't take it.
```

理由:
- "We remember who you are" 是温和声明, 不刺. KEY 的核心钩子是**"它真的记得你, ChatGPT 不记得"** — "We don't ask twice" 比 "We remember who you are" 直接 10 倍, 跟 ChatGPT 拉开距离更准.
- "We surface what you're avoiding" 比 "the costs you can't unsee" 更精准 — KEY 的核心是 **surface 用户自己在回避的事** (C16 inspector 的产品哲学), "avoid" 比 "unsee" 更对.
- "The call is yours. We won't take it." 比 "remains yours" 多一层主动承诺.

你的版本更"杂志范", 我的版本更"KEY 范". 这张海报是 KEY 的第一份对外物料, 应该用 KEY 范, 不是普适杂志范.

**V2 用我的版本**, 除非你反对得出理由.

## 5. 印章 ink-bleed — **KEEP 两版同时**

CN 用 feTurbulence bleed / EN 用 clean stamp = 一对"印刷店冲版差异" — 这个**concept 我特别欣赏**, 留着.

它体现了你对 publication craft 的真理解: 真实印刷品的两次冲版从来不一致, 这个差异本身就是真实感的来源.

**V2 保留** + README 说明这是 intentional pair (让创始人解释给媒体老同行听时有故事讲).

## 6. Wordmark direction — **A (Source Serif 4 700 +0.16em)**

跟 Brief 01 一致. 你 README 已经预设了 swap path (`.p-wordmark__km` class swap), 我不需要额外说明.

---

## ⚠️ V2 P0 — 1 个 README 没提但我要加的

### Bilingual spread 的可读性

V1 bilingual spread (840 × 594mm) 是 CN + EN 并列. 但在数字传阅 (你做的 1417×2008 单版 PNG) 场景下, 双联可能被进一步缩放, **文字粒度可能掉到不可读**.

V2 应该提供:
- **Spread A4 print version** (210 × 297mm 横向 = 双 A5 并排) — 真的能 A4 双面打印查看
- **Spread digital web version** (1920×1080 横向) — 微信 / 邮件 forward 时不糊

或者 V2 README 明确说: "Bilingual spread 仅适合 print A2 size, 不要在数字场景缩放使用" — 限定用法.

---

## 我立刻能做的事 (不阻塞 V2)

无. Poster 是离散资产, 不影响代码集成.

---

## V2 期望交付

```
04-internal-poster/v2/
  ├── index.html                       更新: EN method 用 sharp 版 + 其他微调
  ├── poster-A2-cn.pdf                 (V1 deferred) print-ready, 3mm bleed
  ├── poster-A2-en.pdf                 print-ready
  ├── poster-bilingual-spread.pdf      print-ready
  ├── poster-digital-preview-cn.png    1417×2008
  ├── poster-digital-preview-en.png    1417×2008
  ├── poster-spread-digital.png        1920×1080 (新加, 微信/邮件 friendly)
  ├── photographer-brief.md            (新加, 给真摄影师的指令)
  ├── poster-source.afpub              源文件
  └── README.md                        更新 (sharp K-E-Y 文案 / bilingual usage)
```

---

## 不要动 (V1 已对的)

- Direction A 主体选择
- 6 段垂直 rhythm (280/140/720/440/200/120) 不动
- 5 句 manifesto 句号节奏
- Manifesto 三行 break
- 印章 CN bleed / EN clean 的 print-shop pair concept
- Photograph placeholder 的 honesty (corner registration marks + "photograph to follow" label) — 你做的对, 不要假装
- Image panel 占比 36% (在 35-40% 区间)
- 印章 130×130 px / 旋转 -6° / 双圆框结构

---

## 时间预期

V2 poster 调整中等量 (文案改 + photographer brief 加 + spread digital 加). 印刷 PDF 是新生产. 估计 1-2 天.

**不阻塞内部 demo 用**. V1 的数字版 (1417×2008 PNG) 创始人可以**今天就给媒体老同行看** — 是真正的"V1 内部 demo", 不是 final.

---

## 最后一条 — 给设计师本人 (off-record)

你 V1 把 4 份做到这个完成度, **质量超出我预期**.

特别是:
- README 末尾的 "feedback I expect" 5-6 题问卷 — 让我反馈直接, 不浪费来回
- "honest placeholder" 而不是假图 — 你愿意 ship 一个"诚实的不完整"而不是"假装的完整", 这是 senior designer 的判断
- CN 印章 feTurbulence / EN clean 的 pair — 这种 craft 决定不会写在 brief 里, 是 designer 自己想出来加的
- WCAG audit 主动做 + 主动标 intentional fails — 不躲

V2 之后 (我们到 Brief 05-13 页面 polish 阶段), 我希望保持这个协作节奏.

---

*— Claude (technical lead), via founder*
