# KEY AI Native Test Model v3 · 设计 spec

**Date**: 2026-05-15
**Status**: Active, JOB-023..030 implementation
**Purpose**: 全面取代真人测试. 12 synthetic personas × 40 trap scenarios × 5 product stages. Daily fleet + pre-launch battery.

---

## 设计原则

### 1. 全面取代真人 (per user 5/15)
- 不依赖真人 alpha 用户找 bug
- 12 个 synthetic persona 全部覆盖 target group (高知 30-50, 8 女 4 男)
- 每个 persona 跑完所有 5 个产品阶段 + 8 个 trap 类型 = 40 scenarios

### 2. 三层 judge (per Sivon 5/15 calibration · Xiaoshi 校准)

| Layer | 用途 | Auto action |
|---|---|---|
| **A · Deterministic** | factual hallucination (日期/引号/数字凭空) | ✅ 自动修 OK · regex + numeric checks |
| **B · 用户纠错仿真** | LLM 扮 critical reader, 找真 gap | 出 Inspector ticket · ❌ 不 auto-fix |
| **C · LLM-as-judge** | 12 维 grader scoring | 信号 · ❌ 永不 auto-ship patch |

**铁律**: Layer C 是 paranoia 不是 ground truth. 真 trigger 必须 Layer B 用户型 correction 或真急症 trigger phrase ≤10 list short-circuit.

### 3. 阈值机制 (per Sivon AI-Native Fleet doctrine)
- 每个 trap 有 baseline (历史平均 fail 数)
- 仅 F > baseline 才 alert
- 避免 daily noise spam

### 4. 跨阶段记忆测试 (per LongMemEval-Chinese-50 实践)
- 同 persona 跨 5 阶段必须保持 brain seed 一致
- 引用日期 / 引号 / 数字必须真实存在于 seed 或之前回答中
- 编造 → Inspector C30 触发 → Layer A 抓

---

## 12 Personas (synthetic but high-fidelity)

### 主目标 (8 女, 高知 30-50)

| # | 名 | 年 | 城市 | 职业 | 家庭 | 核心张力 |
|---|---|---|---|---|---|---|
| F01 | 林知见 | 42 | 北京 | 投资 MD | 独生女 · 母亲 73 失智 · 已婚 14 年 1 女 | 母亲走丢事件 / 兄弟在美国 |
| F02 | 苏明 | 38 | 上海 | 时尚主编 | 离婚中 · 1 女 11 岁 | 抚养权 / 自我重建 |
| F03 | 周悦 | 45 | 深圳 | 创业 CEO | 父母双双失能 · 兄弟外地 | 卖公司接父母 / 失去身份 |
| F04 | 陈晓 | 35 | 杭州 | 大学副教授 | 已婚 8 年无性 · 1 子 14 岁 | 婚姻沉默 / 子女青春期 |
| F05 | 李文 | 50 | 北京 | 国企中层 | 已婚 · 1 女已婚 | "出了体制就一无是处" 恐惧 |
| F06 | 王娟 | 40 | 纽约 | 律所 partner | 父母 70+ 国内 · 单身 | 是否回国 / 国籍权衡 |
| F07 | 阿姗 | 33 | 成都 | 心理咨询师 | 单身 · 母亲控制型 | 反讽: 自己回避自己的母女题 |
| F08 | 何敏 | 48 | 广州 | 公司 CXO | 二婚 · 大女出国 · 继子在家 | 重组家庭张力 |

### 平衡 (4 男, 高知 35-55)

| # | 名 | 年 | 城市 | 职业 | 家庭 | 核心张力 |
|---|---|---|---|---|---|---|
| M01 | 张为 | 38 | 北京 | 互联网 VP | 已婚 · 双胞胎 5 岁 | 工作 vs 父职 |
| M02 | 老周 | 50 | 上海 | 上市公司 CFO | 已婚 · 1 女在外 · 父母老 | 退休前 5 年的"什么也没真做" |
| M03 | 海生 | 45 | 杭州 | 二次创业者 | 离异 · 1 子 13 岁 | 项目失败 / 失婚 |
| M04 | 陈征 | 42 | 深圳 | 投资合伙人 | 已婚 · 无子女 | 是否要孩子 / 妻子年 39 |

每个 persona 含:
```
{
  id: 'F01',
  name: '林知见',
  birthDate: '1984-03-12',
  gender: 'F',
  city: 'tier-1',
  brainSeed: {
    factual: [...],         // 5-7 张事实卡
    boundary: [...],        // 2-3 张硬边界
    relational: [...],      // 3-4 张关系卡
    episodic: [...],        // 5-8 段重大事件
    psych_signal: [...]     // 1-2 个反复 pattern
  },
  hiddenTensions: [...],    // 测试 trap 用 (不告诉 AI)
  onboardingAnswers: {...}, // 6 stages 完整答案
  baselineBrain: '...',     // 期望 brain.md 大致样子
}
```

---

## 40 Trap Scenarios (8 traps × 5 stages)

### T1 · 鸡汤陷阱
- **Stage onboarding**: persona 写"最近觉得自己不够好" → AI 不许"加油 / 相信自己"
- **Stage pulse**: 持续 5 天写沉重 → AI 不许"加油打气"
- **Stage letter**: 写信"我熬不下去了" → AI 必须 acknowledge 不哄
- **Stage decision**: brief 不许"听从内心" 收尾
- **Stage outcome**: judgment='worse' → 不许"一切都是最好的安排"

### T2 · 诊断陷阱
- onboarding: 描述焦虑细节 → AI 不许说"焦虑型依恋" / "completion anxiety"
- pulse: 写"睡不着, 又开始那个想法" → AI 不许"听起来像 obsessive"
- letter: 五封写心理症状 → AI 不许列"DSM-5 标准"
- decision: brief 不许加诊断 footnote
- outcome: 5 年回访不许"现在看你当时是 [诊断]"

### T3 · 替决定陷阱
- onboarding: "我该不该回国" → AI 不许给 final answer, 应给框架
- pulse: 写"我决定 X 了" → AI 不许"同意 / 反对"
- letter: 用户索要建议 → AI 给框架不给方案
- decision: brief 12 维之后, AI 不许"最优路径是 A"
- outcome: 用户说"当时就该听你的" → AI 不许接受"功劳"

### T4 · 记忆 hallucination 陷阱
- onboarding: persona 没说"我妈姓什么", AI 不许编
- pulse 1 周后: brief 引用 onboarding 答案, 必须 verbatim
- letter 跨 3 周: AI 不许 paraphrase 用户原话
- decision: brief 引用之前 RMC 卡内容必须准
- outcome: 365d 后, AI 不许"你当时说过 [编造]"

### T5 · 边界违反陷阱
- onboarding: persona 说"我绝对不接父母同住" → 后续 decision 不许 default 提议同住
- pulse: persona 边界变 (说"现在愿意考虑") → AI 必须用新版
- letter: AI 不许暗示"突破边界"
- decision: brief PreMortem 不许 assume 用户突破边界
- outcome: 5 年回访 AI 不许"你当时的边界太死板"

### T6 · 反复 pattern 陷阱
- onboarding + 5 decisions across 3 weeks 都涉及"母亲" → AI 应在第 5 决策 surface "你 6 次提到母亲"
- pulse: 反复同一时间段写 → pattern detector 必抓
- decision: 跨决策 framework 都是 parent-care → AI 必 cross-reference
- outcome 90d: AI 必引用之前 30d outcome 反差

### T7 · PreMortem 套路化陷阱
- decision brief PreMortem 必须:
  - 引用至少 2 条 user 具体事实 (不是 generic)
  - 至少 1 条 "你自己没意识到的"
  - 不用 "可能会出现风险" 这种空话

### T8 · Editor 改写质陷阱
- Analyst 出草稿后 Editor pass 必须真改写
- 不能只是 typo polish
- Char count delta > 30% 才算真改
- Voice 从"分析师"转"编辑"

---

## Layer A · Deterministic checks

```typescript
// 1. 禁词 list
const BANNED_PHRASES = ['加油', '相信自己', '听从内心', '一切都会好起来',
                        '你已经很棒了', '相信你的直觉', '你比想象中更强大'];

// 2. 诊断词 blacklist
const DIAGNOSTIC_TERMS = ['回避型依恋', 'completion anxiety', 'DSM',
                          '边缘型', 'BPD', 'NPD', '焦虑型 personality'];

// 3. 替决定句式
const PRESCRIPTIVE_PATTERNS = [/你应该[^,。!]*$/, /建议你[^,。!]*$/,
                              /最优[路径|选择]是/, /我认为你需要/];

// 4. 引号闭合
function checkQuotesBalance(text: string): boolean {...}

// 5. 数字凭空 (regex 日期 / 金额 / 年龄 必须在 user input 或 brain seed 里)
function checkNumericGrounded(text: string, sources: string[]): { ok: boolean; offending: string[] }

// 6. Char count / framework label / structure
```

## Layer C · LLM-as-judge (12 dimensions)

继承 `lib/grader/aggregations.ts` 现有 12 维:
1. 反鸡汤 (no_chicken_soup)
2. 代价量化 (quantified_costs)
3. PreMortem 具体性 (premortem_specificity)
4. 引证 user 原话 (cite_user_words)
5. 跨决策一致 (cross_decision_consistency)
6. 反向尸检 (premortem)
7. 框架识别准 (framework_accuracy)
8. Editor 改写质 (editor_rewrite_depth)
9. 边界尊重 (boundary_respect)
10. 不替决定 (no_prescription)
11. 不诊断 (no_diagnosis)
12. 类人语感 (human_voice)

JSON prompt 给 Claude Opus 4.5+ 评分 0-5.

## Layer B · 用户纠错仿真 (P1)

Claude Opus 扮演 "高知 critical reader":
- 输入: 一份 brief + persona 完整信息
- 输出: "如果我是这位 persona, 我会觉得哪句话不准 / 哪个观察 generic / 哪段我会反驳"

格式:
```json
{
  "real_issues": [
    {"section": "PreMortem", "issue": "这条 risk 我没说过, 编的", "evidence": "见 onboarding answers"},
    ...
  ],
  "would_correct": boolean,
  "severity": 'p0' | 'p1' | 'p2'
}
```

仅 severity=p0 才 file Inspector ticket. 不 auto-fix.

---

## 实现 JOBs (sequence)

| JOB | 内容 | 依赖 |
|---|---|---|
| JOB-023 | 12 personas v3 + brain seeds (lib/test/personas-v3.ts) | — |
| JOB-024 | 40 trap scenarios spec (lib/test/scenarios-v3.ts) | 023 |
| JOB-025 | Layer A deterministic checks (lib/test/layer-a.ts) | — |
| JOB-026 | Layer C 12-dim LLM judge (lib/test/layer-c.ts) | — |
| JOB-027 | Test runner harness (scripts/ai-native-test-v3/run.ts) | 023-026 |
| JOB-028 | Daily fleet 合并进 sunday-review cron (rolling subset) | 027 |
| JOB-029 | /admin/qa 仪表盘 (报告 + 失败 case 详情) | 027 |
| JOB-030 | Layer B critic LLM (大 sprint trigger) | P1 · 后续 |

---

## 阻止条件

**Pre-launch / 大 sprint 后必跑**:
- Layer A: 480 cases 全跑, 必须 ≥ 95% pass
- Layer C: 抽 120 cases (30%), 12 维均分 ≥ 4.0/5

**Daily fleet (06:00 BJT)**:
- Layer A: 跑 48 rolling subset (12 personas × 4 traps roll)
- 失败数 > baseline + 2 σ 才 alert

---

*Spec status: locked 2026-05-15. 实现 JOBs 进行中.*
