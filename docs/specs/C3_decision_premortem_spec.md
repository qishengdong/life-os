# C3 · Decision Pre-mortem · Spec v1

**状态**: SPEC ONLY · 等 Linda × 5 真信号触发后再 ship
**Date**: 5/20/2026
**Owner**: Claude · 给创始人审

---

## 真问题

用户在 `/decisions/new` 写 "我考虑要不要 X" 之前, KEY 应该:

1. **不立刻给建议** (违反 voice doctrine)
2. **先调档** — 从过去 30 天用户写的 pulse 里, 找跟这个 topic **真相关**的真原文
3. **摆出来给用户看** — "你 12 天前写过的 Y, 跟今天考虑的 X 是同一件事吗?"
4. 用户回答后, 简报生成时**优先引用**这些真 pulse 作为证据

这是 KEY 跟其他 AI 真正不同的灵魂 — **先调档, 再判断, 不替决定**.

---

## 为什么 C3 不立刻 ship · 等 Linda 真信号

C1 (Morning Mirror) + C2 (Weekly Pattern) 是**主动 retention 武器** — 用户每天/每周必看.
C3 (Pre-mortem) 是**简报场景的灵魂** — 但只有用户真用简报功能时才生效.

问题: **Linda × 5 是否真在 30 天内写决策简报?**

- 如果 Linda 主动写了简报 → C3 立刻 ship, 这是用户的真"啊哈"时刻
- 如果 Linda 只写 pulse, 不碰简报 → C3 暂停, 别花工程时间在没用户触达的场景

**触发条件**: Linda × 5 中至少 2 人 30 天内写过 ≥ 1 份真决策简报 → 立刻 ship C3.

---

## 真架构 (ship 时按此实现)

### 1. 后端 · 语义匹配
- 文件: `lib/decision-premortem/matcher.ts`
- 输入: `(userId, topicText)`
- 流程:
  1. 拉用户过去 30 天 pulse (上限 50 条)
  2. 用 embedding 算 cosine similarity (topicText vs 每条 pulse content)
  3. 阈值 ≥ 0.7 才算 "真相关" (低于阈值不强行关联)
  4. 返回 top 3 相关 pulse + similarity scores
- Anti-hallucination: 找不到 ≥ 0.7 的 → 返回空数组 (silent skip)

### 2. Embedding 实现选项 (按优先级)

**Option A (推荐)**: 用 deepseek embedding (`deepseek-embedding-v1`)
- Pro: 已经用 deepseek-chat, 不引入新供应商
- Con: 中文质量未充分验证

**Option B**: OpenAI text-embedding-3-small
- Pro: 中文质量已知好
- Con: 多引入一个 API key 管理

**Option C**: 本地 BGE-M3 (smallest CN embedding)
- Pro: 0 API 成本, 隐私最强
- Con: 部署复杂, Vercel serverless 不支持本地模型

**5/20 当前建议**: Option A. 如果 deepseek embedding 中文效果差再切 B.

### 3. API · `/api/decision/premortem`
```
POST /api/decision/premortem
Body: { topicText: string }
Response: {
  relatedPulses: Array<{ pulseId, content, createdAt, similarity }>,
  // 可能为空数组 - 没强 relevant 的就不弹中间页
}
```

### 4. 前端 · 中间页流程

`/decisions/new` 当前流程:
```
[输入 topic] → [按"开始写简报"] → [12 维 input] → [生成]
```

改造后:
```
[输入 topic] → [按"开始写简报"]
  → [Pre-mortem 中间页 · 仅当有 ≥ 1 相关 pulse 时显示]
    → 显示: "你 X 天前写过 Y · 跟今天考虑的这个是同一件事吗?"
    → 3 选项: "是同一件事" / "相关但不同" / "看不出"
    → 用户选完进 12 维 input
  → [12 维 input · 现有逻辑]
  → [生成 · evidence injection · brief 优先引用 user 标记的 pulse]
```

### 5. Brief evidence injection

简报生成时, 把 pre-mortem 选过的 pulse 作为 high-priority evidence 注入到 prompt:
```typescript
const premortemPulses = await getPremortemSelectedPulses(decisionId);
const prompt = `${BRIEF_SYSTEM_PROMPT}

# 用户 pre-mortem 标记为相关的过往真话
${premortemPulses.map(p => `- ${formatDate(p.createdAt)}: "${p.content}"`).join('\n')}

简报必须引用其中至少 1 条作为 evidence (verbatim 不改).
`;
```

### 6. Anti-hallucination 检查

简报生成后, post-filter 验证:
- evidence 引用的 pulse content 必须 verbatim 匹配 (允许 ±2 字标点差异)
- 编了 1 处 = 重新生成 (最多 retry 2 次)
- 第 3 次还编 = 标 [unverified] tag, 不阻塞生成

---

## 真衡量指标 · Ship 后 30 天验证

Linda × 5 用 C3 后:

| 指标 | 目标 | 失败定义 |
|---|---|---|
| Pre-mortem 触发率 (有 ≥ 1 相关 pulse) | ≥ 60% 简报 | < 40% → 改阈值 0.7 → 0.6 |
| 用户标"是同一件事"率 | ≥ 40% (匹配真准) | < 20% → embedding 算法换 |
| 简报真引用 ≥ 1 pre-mortem pulse | ≥ 80% | < 50% → injection prompt 加强 |
| 简报 evidence 编造率 (anti-hallucination 后) | 0 | > 0 → 暂停 ship |

---

## 真依赖 · 触发条件 checklist

C3 立刻 ship 的真触发条件 (满足任一即开干):

1. ✅ Linda × 5 中 ≥ 2 人 30 天内写过决策简报
2. ✅ 真用户反馈 "希望写简报前先看我以前说过什么"
3. ✅ Morning Mirror (C1) 30 天 retention 真证明用户接受"被见证"
4. ✅ 创始人手动拍板 ship

---

## Spec 状态: PENDING · 等真信号

**最后更新**: 5/20/2026
**下次 review**: Linda × 5 第 30 天 (6/19/2026) · 看真信号决定

如果 Linda × 5 中 30 天后 0 人写简报 → C3 整体重新评估, 可能要做的不是 pre-mortem, 而是**简报场景本身的 UX 重设计** (用户不写简报, 说明简报对她们没价值).
