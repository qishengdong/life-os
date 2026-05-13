# Phase 4 总览 · KEY 从 "决策工具" → "私人编辑 + 长期通信"

**Date**: 2026-05-13
**触发**: 用户反馈 "KEY 不能只在重大决策时被想起来. 高端用户内心里堆着一大堆跟谁都说不出口的话题, 这些每天都在发酵. 我要让他们每天都愿意来 KEY 写点什么, 同时 KEY 的回应要值得让他写第 100 次."

---

## 决策定调 (3 个 north star)

1. **Letters 是 KEY 真核心, brief 是旗舰 / 月度活动** — 入口 rebalance
2. **Canon library 必做** — 这是 KEY 跟 ChatGPT 的真护城河
3. **视觉先 ship (✅ done), letters MVP 紧接着开**

---

## Phase 4 全景路线 (5 sprint, 4-5 周)

| Sprint | 内容 | 周期 | 当前 |
|---|---|---|---|
| 视觉 V4 | paper grain / 满版 hero / ISSUE 大字号 / 首页 illust 底图 | 1 天 | ✅ 045e8d7 |
| **4a · Letters MVP** | /letters 路由 + UI + KEY 回信 pipeline (单 pass, voice spec) + 信件列表 | 1 周 | ⏳ 启动 |
| 4b · Canon library 基础 | `canon_quotes` table + 200-400 条精选 + embedding 索引 + retrieval API + 接进 letter pipeline | 1 周 | 待 4a |
| 4c · Brain UI 升级 | /brain 重构为"通信集 / 思考集"主题视图 | 1 周 | 待 4b |
| 4d · Sunday Review 升级 | review 不只看 pulse, 也看 letters; 输出 2000 字编辑回信 | 1 周 | 待 4c |
| 4e · Canon + Framework 持续扩 | 每周 +50-100 引文; 每月 +5-10 sub-framework | 持续 | 4b 起 |

---

## 5 层产品架构 (Phase 4 完成后的形态)

```
高频 ──────────────────────────────────────────► 低频

┌──────────┬──────────┬──────────┬──────────────┬──────────┐
│ LETTERS  │  PULSE   │  BRAIN   │ SUNDAY REVIEW│  BRIEF   │
│          │          │          │              │          │
│ 每天     │ 每天     │ 随时翻   │  每周日      │ 重大决策 │
│ 1-3 封   │ 3-10 条  │          │              │ 时来     │
│          │          │          │              │          │
│ "今天    │ "今天    │ "我        │ "这周 KEY    │ "我面临  │
│ 我心里   │ 发生     │ 是      │ 看见了       │ 一个     │
│ 在想..." │ 什么"    │ 谁"      │ 什么"        │ 大决定"  │
└──────────┴──────────┴──────────┴──────────────┴──────────┘
   4a 新增   现有     现有/4c    现有/4d         现有
```

---

## Canon library (内功 · 3 层结构)

```
┌──────────────────────────────────────────────┐
│  A · KEY Canon  (引文 / 案例库 · 通用)        │
│      1000-3000 条 高密度 quotes               │
│      Philosophy / Psychology / 文学 / 史      │
│      Embedding 索引 (OpenAI 3-large)         │
│                                              │
│  B · KEY Frameworks  (决策框架)              │
│      7 个 → 扩到 30-50 个 sub-framework      │
│                                              │
│  C · User Doctrine  (用户专属, 每人一套)     │
│      现有 Brain 升级版                       │
└──────────────────────────────────────────────┘
                    │
                    ▼
   letter pipeline / brief pipeline:
   每次生成都从 A + B + C 三库 retrieval
```

---

## 详细规划文档

- [01-letters-mvp-plan.md](./01-letters-mvp-plan.md) — Phase 4a 完整 sprint plan (db schema + UI + pipeline + voice spec)
- [02-canon-library-plan.md](./02-canon-library-plan.md) — Phase 4b plan (待 4a 进 ship 前 finalize)
- [03-brain-ui-plan.md](./03-brain-ui-plan.md) — Phase 4c plan (后写)
- [04-sunday-review-v2-plan.md](./04-sunday-review-v2-plan.md) — Phase 4d plan (后写)

---

## 跨 Phase 守则

| 维度 | 守则 |
|---|---|
| Voice | 严格遵守 voice spec, 不允许 LLM 自由发挥成鸡汤 |
| 视觉 | 不允许气泡 / streaming text / emoji / "对话历史" 列表. 永远是"信件"形式 |
| 隐私 | 用户 letter 内容 SSL + 本机 SQLite, 不进任何第三方训练 |
| 节奏 | KEY 不 7×24 即时, 不主动催, 不"加油" |
| 评价 | KEY 永远不说"对错". 它**讨论**, 不**判决** |
| 记忆 | brain retrieval 必须真的 retrieve, 不是 prompt 塞历史 |
