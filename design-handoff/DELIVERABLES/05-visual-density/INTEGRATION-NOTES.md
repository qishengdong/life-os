# 05 · Visual Density (V3)

**Phase**: V3 — Publication-grade visual density
**Date**: 2026-05-13
**Status**: Brief sent, awaiting Claude Design + Lovart delivery

---

## 这个目录是什么

V3 视觉资产交付目录, 跟 01-key-wordmark / 02-color-palette / 03-typography / 04-internal-poster 平级.

KEY 主体 V1+V2 设计 (wordmark / palette / typography / poster) 已完成并集成代码. V3 阶段加视觉密度 — fleuron / 印章 / marginalia ornament / editorial illustration, 让 KEY 从"有品牌"升级到"有出版物质感".

## 两份 brief

| Brief | 给谁 | 产出 | 文件 |
|---|---|---|---|
| **CLAUDE-DESIGN-BRIEF.md** | Claude Design | 10 fleuron + 3 brief 印章 + 8 marginalia ornament = 21 个 SVG | `fleurons/` + `seals/` + `marginalia/` |
| **LOVART-BRIEF.md** | Lovart | 3 张 editorial engraving illustration (parent-care / marriage / child-education) | `illustrations/` |

## 目录约定

```
05-visual-density/
├── README.md                   ← 你正在看
├── CLAUDE-DESIGN-BRIEF.md      ← Claude Design 看的, 不要改
├── LOVART-BRIEF.md             ← Lovart 看的, 不要改
├── fleurons/                   ← Claude Design 交付 (10 个 SVG)
├── seals/                      ← Claude Design 交付 (3 个 SVG)
├── marginalia/                 ← Claude Design 交付 (8 个 SVG)
└── illustrations/              ← Lovart 交付 (3 张 PNG, 可选 3 张 SVG)
```

## 集成路线

交付物落到这个目录后, 我会:
1. 把 SVG 拷到 `public/brand/<subdir>/`
2. 把 PNG 拷到 `public/illustrations/`
3. Swap `app/globals.css` 里的 Unicode 占位 ('✦' '⊙' 等) → 真 SVG
4. BriefRenderer 右上角占位 `<div className="...rounded-full">` → `brief-seal-round.svg`
5. sample brief 顶部加 illustration block (在 brief 编号印章下方, 标题上方)
6. methodology 章节之间加 fleuron 分隔

集成后 commit + push.

## 反馈/修改约定

- V1 交付后我会写 V2 反馈 markdown (放在 `v1-feedback/`, 跟 04-poster 的 V1→V2 一样)
- 任何不确定都做, 多余的我删
- 单色 SVG `fill="#111111"` 或 `fill="#7C2330"` 必须顶层 attribute, 便于代码统一改色
- 不嵌入 `<text>`, 文字都 outline 化
