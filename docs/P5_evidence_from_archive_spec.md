# P5 · Evidence from Archive · Design Spec
*Status*: Draft · 2026-05-18  
*Owner*: 用户拍后 ship

## 一. 为什么 (产品哲学层)

GPT 5/18 提的核心: KEY 跟 ChatGPT 决策建议真区别 = 简报真引用用户档案里的话.

> "因为它每天都在帮用户保存未来大事的证据."

但 GPT 也提醒:
> "为了引用而引用, 会变成假亲密. KEY 的高级感来自诚实, 不来自强行'我记得你'."

→ **不强求每份简报必含引用**. 找到合适证据时引用; 找不到时**老实说"档案证据不足, 简报主要基于本次输入"**.

## 二. 何时触发 evidence 检索

写 Brief 时 `lib/decision/brief-pipeline.ts` 已经 fetchUserMemory(userId), 拿到全 brain 给 analyst prompt 作为 context. 这本身就是某种"档案进 brief".

**新加的不同**:
1. **显性引用** — analyst prompt 强制写一个 `appendix.evidenceFromArchive` 字段, 含 0-N 条 verbatim quote + 来源 (今日一句 / 未交付的信 / 之前决策 / 硬锚点)
2. **brief 渲染** — section IX (现 appendix) 或新 section "你档案里的证据" 显示这些引用
3. **可点跳回** — 每条 evidence 显示原始链接 (跳 /pulse/N 或 /unsent/N)

## 三. evidence 来源池

按优先级:

| 来源 | 何时 grounded | 怎么搜 |
|---|---|---|
| **硬锚点 (core_state)** | 总相关 | LLM 直接 see 全部 (前 8 条) |
| **过去 30 天今日一句 tag 命中** | 决策框架跟 tag 重合 | API 拉 last 30d pulses, filter tags 跟 decision keywords 重合 |
| **过去 60 天 unsent letters · category 重合** | 决策涉及关系 | API 拉 last 60d unsent, filter category |
| **过去 6 个月 RMC factual/relational** | 反复提到的人 / 事 | LLM 直接 see (前 12 条) |
| **之前 decision briefs** | 同框架决策 | DB select where framework=current + last 1y |

V1 不做最后一项 (跨决策引用), V2 加.

## 四. 数据流

```
POST /api/decision/brief
  → fetchUserMemory(userId)  // 已有
  → fetchEvidencePool(userId, decisionText, framework)  // 新加 · 60d pulses + unsent + RMC + brief
  → generateBrief(input + memory + evidencePool)
    → analyst pass:
        prompt 给 evidence pool · 让它从中挑 0-5 条 verbatim 用 (不能编)
        必填 appendix.evidenceFromArchive (可为 [])
    → editor pass: 文本润色, 不动 evidence
  → save brief with evidence JSON
  → render: brief detail page show new section "你档案里的证据"
```

## 五. analyst prompt 修改

`lib/decision/brief-prompts.ts` ANALYST_SYSTEM_PROMPT 加 section:

```
# Evidence from Archive · 这一节是 KEY 真护城河

用户的档案里可能有相关证据. user message 含 "[ARCHIVE EVIDENCE POOL]" section.

你的工作:
1. 看 evidence pool 是否真有跟当前决策**直接相关**的话
2. 真相关 → 挑 0-5 条 verbatim 引用, 写入 appendix.evidenceFromArchive
3. 不相关 → evidenceFromArchive: []. 不要凑.

格式:
{
  "appendix": {
    "evidenceFromArchive": [
      {
        "source": "今日一句 | 未交付的信 | 硬锚点 | 之前决策",
        "originalDate": "2026-05-12",
        "originalId": "pulse-5 | unsent-3 | core-1",
        "excerpt": "user 原话 (≤80 字, verbatim)",
        "relevance": "为什么跟现在决策有关 (一句话)"
      }
    ],
    ...其他 appendix 字段
  }
}

# 严禁
- 编 user 没说过的话 (Inspector C30 会抓)
- 为了凑数引用不相关内容
- 解释 / paraphrase / 美化 原话
```

## 六. 渲染 (brief detail page)

`/decisions/[N]` 顶部 (或 section IX 之后):

```
· 你档案里的证据 ·
KEY 写这份简报时, 用了你之前说过的这些话:

> "我妈每周一次电话, 每次都心累, 但没断."
> ── 你 2026-05-12 的今日一句

> "我跟丈夫说工作'挺好的', 但每天闹钟响 5 秒钟想'假如今天我不去'"
> ── 你 2026-04-29 的今日一句

(每条带链接跳原始来源)
```

如果 evidenceFromArchive 是 []:

```
· 档案证据不足 ·
这份简报主要基于你本次提交的内容. KEY 你的档案还浅, 多写几次今日一句 / 未交付的信, 下次决策简报会从档案里调出相关证据.
```

## 七. Inspector C-evidence 守门 (反幻觉)

新加 check C31 · Evidence Grounding:
- 解析 brief.appendix.evidenceFromArchive
- 对每条 excerpt 验证: 真在用户档案中 (pulses / unsent / rmc / brief) 找到
- 找不到 → flag 'p0:fabricated_evidence' · 写 inspector_audit

V0 shadow only. V1 阻止 brief 发布 (regenerate without evidence section if any fail).

## 八. UI 边角

- 简报详情页加 "你档案里的证据" section 在最后
- /home 4 张主卡之一可以是 "你的档案 (X 张证据 ready for 下次决策)"
- 决策画像页 (/your-pattern) 也加 "你的画像基于 X 张档案 fact" 一行

## 九. 工程估时 + 阶段

| Stage | 内容 | 时长 |
|---|---|---|
| **P5.1** | analyst prompt 改 + evidencePool 函数 + brief-schema 类型 | 0.5 天 |
| **P5.2** | brief detail page 渲染新 section + 跳链 | 0.5 天 |
| **P5.3** | "档案证据不足" fallback 文案 | 0.5 天 |
| **P5.4** | Inspector C31 (shadow) | 0.5 天 |
| **P5.5** | 真用户跑 1 份决策, prod 验证有引用真 ground | — |
| **P5.6** (V2) | 跨决策引用 + drift detection | 后续 |

## 十. 风险

1. **LLM 编引用** — Inspector C31 兜底. 但 V1 shadow 期会有假阳性, 必须人工审 (Linda × 5 进来后).
2. **没足够档案的用户** — Phase 1 用户头几次决策必触发 "档案证据不足", 文案要顺, 不能让用户觉得 KEY 不行
3. **brief 总时 + ~5s** — evidence pool query + 大 prompt · 但 Hotfix skipEditor=true 已经省了 15-25s, 总能 < 60s
4. **隐私** — evidence 引用必须 user_id scoped (现有), 不可能跨 user 泄

## 十一. 拍板项 (等你)

1. **新 section 叫什么**: "你档案里的证据" / "KEY 从你档案里调出的" / "证据 · Evidence" — 我推 "你档案里的证据"
2. **没证据时文案**: "档案证据不足" / "KEY 还在了解你" / "档案还浅" — 我推 "档案证据不足, 简报主要基于本次输入"
3. **每份简报最多引用几条**: 3 / 5 / 不限 — 我推 0-5 条 (空也可)
4. **Inspector C31 V0**: shadow (写日志) / active (block + regenerate) — 我推 shadow 先 7 天, 再 active

---

*下一步*: 你拍上 4 项后, 我开干 P5.1-P5.4 (估 1.5-2 天 + CI 验证).
