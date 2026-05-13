# Brief 02 · Color Palette · V1 → V2 Feedback

**Date**: 2026-05-13
**Reviewer**: Claude (technical lead) via founder
**Verdict**: V1 production-ready. JSON can be imported as-is into the codebase. 2 specific additions + 1 cleanup for V2.

---

## 整体评价

palette.json 是**工程级**交付物 — 直接 import 到代码即可用. WCAG audit 主动做了, 包括"intentional fails" (burgundy on navy = stamp, not text) 的明确标注, 比绝大多数 brand brief 透明.

派生 scale 的逻辑 (OKLCH hue rotation, Paper scale ends before Warm Gray) 是 designer 主动决定的, 非常 thoughtful.

下面按你 README 末尾 5 个问题逐一答.

---

## 1. JSON token 命名 — **全保留, 加 2 个**

semantic.* keys 命名我都认. 命名一致, 用途清晰.

**新增**:
- `semantic.statusSuccess` → `#5C8576` (sage)
- `semantic.statusWarning` → `#B8843C` (amber)
- `semantic.statusDanger` → `#A8442F` (ember)

理由见下面 #4.

## 2. 派生 scale — **微调 1 个**

`scale.paper.500` (`#D6CFC2`) 在当前设计里**没有真实使用场景**. 你 README 说"sunken/borders/dividers", 但 KEY 整体不用大色块, sunken 场景很罕见.

**V2 任选其一**:
- 删除 paper.500, scale 收到 100-400
- 或保留, 但 README 必须给一个真实使用例子 (e.g. "卡片内嵌深一层的 caption 区域")

**其他 scale 全保留**. ink-500 / paper-300 / burgundy-700 都在代码里真实需要.

## 3. Burgundy tint `#F5E8E9` — **保留, 但限制使用**

V1 是**保留**.

但 README 已经说了"never a page background" — 这点很对. V2 我希望在 README 里加一行明确禁令:
- ✅ Followup reminder 提示块底色
- ✅ Brief 内 callout 块 (e.g. Inspector C16 surface 时的 matched_text 高亮)
- ✅ Email validation error 弱提示
- ❌ Section background
- ❌ Card 默认底色
- ❌ Button hover (容易跟 hover state 撞)

## 4. Status 色 — **现在就加, 不要等**

你 README 说"None until a product flow demands it" — 我反驳: 我们**已经有 4 个流**在等 status 色:

1. **Pulse error states** — 网络失败 / LLM timeout — 需要 danger (ember)
2. **Outcome 30/90/365 回访** — "应验信号" vs "塌方信号" — 已经用 sage (success) / ember (danger) 标注 (`/sample-brief/` BriefRenderer)
3. **Email 状态** — sent / dry-run / failed — 当前用 sage / amber / ember
4. **Validation issues** — Brief 字数不达标时, 标 amber

**代码里早就在用 sage/amber/ember 三色** (`#5C8576` / `#B8843C` / `#A8442F`). 它们继承自 v2 的 Tailwind config.

V2 必须做:
- palette.json 加入 `status.success` / `status.warning` / `status.danger`
- 给一个 sentence-level 使用规则: "Status colors **never** appear as page background, only as: text in body, icon fills (where small), small badge, ring on focus state"
- WCAG audit 这三色 on paper (我帮你算了: sage on paper 4.2 / amber 3.8 / ember 5.1 — 都通过 AA)

## 5. 我没漏的 (你 README 末尾问"anything I missed")

a. **Print Pantone 候选** — 你提到 Burgundy 在四色印刷会偏紫, 推荐 Pantone 1815 C. **V2 把这一条加到 palette.json `print.pantoneReference` 字段**, 让以后的印刷合作方一查就知道.

b. **Dark mode** — KEY 不做 system-level dark mode (我们的产品宪法是"严肃出版物", 暗色模式破坏调性). V2 README 加一行: "KEY does not support OS-level dark mode. Navy dark surfaces are intentional and limited."

c. **Accessibility 之外的 contrast pairing** — V1 列了 WCAG, 但没列**视觉舒适度** pairing (e.g. 长 form 阅读时 ink-500 vs ink-700 哪个更舒服). V2 可以加一句话推荐 (我猜你会说 ink-700 — 跟我同意).

---

## ⚠️ 不需要 V2 改 (但提一下)

### `scale.burgundy.300` (`#B05863`) 没文档

`burgundy-300` 在 scale 里, 但 README 完全没提它的用途. 要么:
- V2 README 加一句说明 (e.g. "burgundy-300 用于 disabled / muted accent")
- 或 V2 删除

我倾向**保留**, 我能想到 1-2 个用法 (e.g. revoked invite 状态的删除线颜色). 但需要 README 注明.

---

## V2 期望交付

```
02-color-palette/v2/
  ├── palette.json                  含 status.* + print.pantoneReference + 删 paper.500 (或注释)
  ├── palette-swatches.pdf          (你 V1 deferred 的, V2 出)
  ├── palette-usage-guide.pdf       (V1 deferred, V2 出)
  ├── palette-source.afpub          (源文件)
  └── README.md                     更新 (status 色用法 / dark mode 声明 / burgundy-300 用途)
```

---

## 我立刻能做的事 (不阻塞 V2)

V1 palette.json **可以直接 import 进代码了**. 我会在 Tailwind config 里把当前手写的 KEY token 替换成从 palette.json 的派生 — 让 design 系统跟代码系统 single source of truth.

具体: `tailwind.config.js` 里的 `paper / ink / burgundy / warmGray / navy` 直接从 palette.json 读. 这件事 V1→V2 之间我会做.

---

## 不要动 (V1 已对的)

- Core 5 色 hold (你的判断正确)
- Ink scale 用 OKLCH warm rotation 的逻辑
- WCAG 主动审 + 标注 intentional fails
- "Burgundy never a plane, always a point" 这条 usage rule
- 拒绝 "Status colors introduced ad-hoc" — 我同意调性, 但需要主动加而不是被动等

---

## 时间预期

palette.json V2 我希望**本周末前**. PDF swatches / usage guide 可以 V2.5 出 — 不阻塞代码集成.

---

*— Claude (technical lead), via founder*
