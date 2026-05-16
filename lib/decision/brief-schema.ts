/**
 * Decision Brief Schema — publication-grade 决策简报数据结构
 *
 * 这是 LifeOS 的"交付物". 不是 markdown 流, 是一份结构化的私人简报:
 * 9 个 section + 附录, 总长 2000-3500 字, 出版物级 craft.
 *
 * 产生流程:
 *   1. Analyst pass — 决策分析师 LLM 产出 9 个 section 的结构化分析
 *   2. Editor pass — 资深编辑 LLM 改写 (authored, not generated)
 *   3. 保存为 DecisionBrief, 写入 db
 *
 * 渲染由 BriefRenderer (React component) 完成, 严格按出版物排版.
 */

import type { FrameworkType } from './router';

// ============================================================================
// 三条路径 (Path Option) — 决策的三种走法
// ============================================================================
export interface PathOption {
  /** 路径名称, 一句话, 不超过 20 字 */
  name: string;

  /** 5 年后图景: 用具体场景描写, 让用户能"看见", 不抽象. 120-180 字 */
  fiveYearScene: string;

  /** 主要代价: 量化 (时间/金钱/关系/机会). 80-120 字 */
  primaryCost: string;

  /** 受益者 vs 受损者: 谁受益谁受损, 不回避 stakeholder. 50-80 字 */
  whoBenefitsWhoLoses: string;
}

// ============================================================================
// 附录: 记忆引用
// ============================================================================
export interface MemoryReference {
  /** 类型: 来自 brain / hardAnchor / RMC 卡片 / 历史 Pulse / 历史决策 */
  source: 'brain' | 'hard_anchor' | 'rmc' | 'pulse' | 'decision';

  /** 引用的内容片段, 直引用户原话 */
  excerpt: string;

  /** 时间或来源标识 (e.g. "2026 年 1 月 13 日 Pulse" / "brain.md 家庭结构") */
  attribution: string;

  /** 为什么这条记忆跟当前决策有关 (一句话) */
  relevance: string;
}

// ============================================================================
// 附录: 回访锚点
// ============================================================================
export interface OutcomeAnchor {
  /** checkpointDays: 30 / 90 / 365 */
  days: 30 | 90 | 365;

  /** 那一天我们要回访问的具体问题 (具体, 不抽象) */
  question: string;

  /** 怎样算决策"应验了" — 给用户校准用 */
  successSignal: string;

  /** 怎样算"塌了" — 给用户校准用 */
  failureSignal: string;
}

// ============================================================================
// 完整 Brief
// ============================================================================
export interface DecisionBrief {
  /** 简报号, 格式 KB-YYYYMMDD-NNN */
  briefNumber: string;

  /** 决策主题 (短题目, 不超过 30 字) */
  topic: string;

  /** 撰稿日期 (unix epoch 秒) */
  authoredAt: number;

  /** 撰稿署名 — 固定为 "KEY" */
  authoredBy: string;

  /** 用户匿名 ID (展示用, 不暴露 user_id) */
  authoredFor: string;

  // ==========================================================================
  // 正文 9 节
  // ==========================================================================
  sections: {
    /** I. 封面摘要 — 100 ± 20 字, 让用户 10 秒内知道这份简报讲什么 */
    summary: string;

    /** II. 背景 — 200 ± 30 字, 用户的处境, 不是问题描述, 是 setting */
    background: string;

    /** III. 当前张力 — 200 ± 30 字, 决策卡住的真正点, 不是表面冲突 */
    currentTension: string;

    /** IV. 关键利益相关者 — 150 ± 30 字, 谁会受影响, 谁有 veto, 谁的声音被忽略 */
    stakeholders: string;

    /** V. 不可逆风险地图 — 200 ± 30 字, 这件事最不可挽回的几个 worst case */
    irreversibleRisks: string;

    /** VI. 三条路径 — 总长 500-700 字, 不是 brainstorm 三个选项, 是三种 well-formed 走法 */
    threePaths: [PathOption, PathOption, PathOption];

    /** VII. 反向尸检 — 300 ± 40 字, 假设这事 3 年后塌了, 推断哪里塌的 */
    preMortem: string;

    /** VIII. 核心拷问 — 1-2 个 cracking question, 加起来 80-120 字 */
    crackingQuestions: string[];

    /** IX. 最小下一步 — 100 ± 20 字, 一个 24 小时内能做的具体动作 */
    minimumNextStep: string;
  };

  // ==========================================================================
  // 附录
  // ==========================================================================
  appendix: {
    /** 附录 A: 引用了 brain 中的 4-6 条记忆 (一份认真的简报必须 ground 在用户历史里) */
    memoryReferences: MemoryReference[];

    /** 附录 B: 30/90/365 天回访锚点 */
    outcomeAnchors: [OutcomeAnchor, OutcomeAnchor, OutcomeAnchor];
  };

  // ==========================================================================
  // 元信息
  // ==========================================================================
  meta: {
    /** 框架类型 (parent-care / marriage / etc.) */
    framework: FrameworkType;

    /** 分析师 pass + 编辑 pass 的总 token 消耗 */
    tokensUsed: number;

    /** 是否经过 editor pass (false = 仅 analyst, 调试/降级用) */
    editorPassUsed: boolean;

    /** 总字数 (中文按字, 不算空白) */
    totalCharCount: number;

    /** AI 生成声明 — 合规要求, footer 显示 */
    aiDisclosure: string;

    /** 两次 LLM 调用各自耗时 (毫秒) */
    durationMs: {
      analyst: number;
      editor: number;
    };
  };
}

// ============================================================================
// 工具: Brief number 生成
// ============================================================================
export function generateBriefNumber(date?: Date): string {
  const d = date ?? new Date();
  const yyyymmdd =
    d.getFullYear().toString() +
    (d.getMonth() + 1).toString().padStart(2, '0') +
    d.getDate().toString().padStart(2, '0');
  // 同日内多份 brief 用秒级时间戳后 3 位区分
  const seq = (d.getTime() % 1000).toString().padStart(3, '0');
  return `KB-${yyyymmdd}-${seq}`;
}

// ============================================================================
// 工具: 中文字数计算 (不含空白 / 标点)
// ============================================================================
export function countCharsCN(text: unknown): number {
  if (typeof text !== 'string') return 0;
  return text.replace(/\s+/g, '').replace(/[\p{P}]/gu, '').length;
}

// ============================================================================
// 工具: 验证一份 Brief 是否合规 (字数 / 完整性)
// ============================================================================
export function validateBrief(brief: DecisionBrief): {
  valid: boolean;
  issues: string[];
  totalCharCount: number;
} {
  const issues: string[] = [];
  const s = brief.sections;

  // 字数范围检查 (允许 ±20% 误差)
  const checks: Array<[string, string, number, number]> = [
    ['summary', s.summary, 80, 120],
    ['background', s.background, 170, 230],
    ['currentTension', s.currentTension, 170, 230],
    ['stakeholders', s.stakeholders, 120, 180],
    ['irreversibleRisks', s.irreversibleRisks, 170, 230],
    ['preMortem', s.preMortem, 260, 340],
    ['minimumNextStep', s.minimumNextStep, 80, 120],
  ];

  for (const [name, content, min, max] of checks) {
    if (typeof content !== 'string' || content.length === 0) {
      issues.push(`section "${name}" 缺失或非字符串 (got ${typeof content})`);
      continue;
    }
    const n = countCharsCN(content);
    if (n < min * 0.8) issues.push(`section "${name}" 偏短: ${n} 字 (期望 ${min}-${max})`);
    if (n > max * 1.2) issues.push(`section "${name}" 偏长: ${n} 字 (期望 ${min}-${max})`);
  }

  // 三条路径必须各自完整
  if (!s.threePaths || s.threePaths.length !== 3) {
    issues.push('threePaths 必须有 3 条');
  } else {
    s.threePaths.forEach((p, i) => {
      if (!p.name || p.name.length === 0) issues.push(`path[${i}].name 缺失`);
      if (!p.fiveYearScene || countCharsCN(p.fiveYearScene) < 80) {
        issues.push(`path[${i}].fiveYearScene 偏短`);
      }
      if (!p.primaryCost) issues.push(`path[${i}].primaryCost 缺失`);
    });
  }

  // 拷问至少 1 个最多 2 个
  if (!s.crackingQuestions || s.crackingQuestions.length === 0) {
    issues.push('crackingQuestions 至少 1 个');
  } else if (s.crackingQuestions.length > 2) {
    issues.push('crackingQuestions 最多 2 个');
  }

  // 附录: 记忆引用至少 3 条 (没有 ground 在用户历史的 brief 不算 brief)
  if (!brief.appendix.memoryReferences || brief.appendix.memoryReferences.length < 3) {
    issues.push('memoryReferences 至少 3 条 — 没有 ground 在用户历史的 brief 不合格');
  }

  // 附录: 三个 outcome anchor 完整
  if (!brief.appendix.outcomeAnchors || brief.appendix.outcomeAnchors.length !== 3) {
    issues.push('outcomeAnchors 必须有 30/90/365 三个');
  }

  // 总字数
  const totalText =
    s.summary + s.background + s.currentTension + s.stakeholders +
    s.irreversibleRisks + s.preMortem + s.crackingQuestions.join('') + s.minimumNextStep +
    s.threePaths.map((p) => p.fiveYearScene + p.primaryCost + p.whoBenefitsWhoLoses).join('');
  const totalCharCount = countCharsCN(totalText);

  if (totalCharCount < 1800) issues.push(`总字数偏短: ${totalCharCount} (期望 2000-3500)`);
  if (totalCharCount > 4000) issues.push(`总字数偏长: ${totalCharCount} (期望 2000-3500)`);

  return {
    valid: issues.length === 0,
    issues,
    totalCharCount,
  };
}

// ============================================================================
// 渲染: Brief → publication-grade markdown
// ============================================================================
export function renderBriefMarkdown(brief: DecisionBrief): string {
  const d = new Date(brief.authoredAt * 1000);
  const dateLabel = `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
  const s = brief.sections;

  const pathMd = (p: PathOption, idx: number) => `
### 路径 ${['A', 'B', 'C'][idx]} — ${p.name}

**五年后图景**
${p.fiveYearScene}

**主要代价**
${p.primaryCost}

**谁受益, 谁受损**
${p.whoBenefitsWhoLoses}
`.trim();

  const memMd = brief.appendix.memoryReferences
    .map((m, i) => `${i + 1}. **${m.attribution}** — ${m.excerpt}  \n   *为什么相关*: ${m.relevance}`)
    .join('\n\n');

  const anchorMd = brief.appendix.outcomeAnchors
    .map((a) => `**${a.days} 天后**: ${a.question}  \n应验信号: ${a.successSignal}  \n失败信号: ${a.failureSignal}`)
    .join('\n\n');

  return `# ${brief.topic}

> **${brief.briefNumber}**  ·  ${dateLabel}  ·  撰稿 ${brief.authoredBy}  ·  致 ${brief.authoredFor}

---

## I.  封面摘要

${s.summary}

## II.  背景

${s.background}

## III.  当前张力

${s.currentTension}

## IV.  关键利益相关者

${s.stakeholders}

## V.  不可逆风险地图

${s.irreversibleRisks}

## VI.  三条路径

${s.threePaths.map((p, i) => pathMd(p, i)).join('\n\n')}

## VII.  反向尸检

${s.preMortem}

## VIII.  核心拷问

${s.crackingQuestions.map((q, i) => `**${i + 1}.** ${q}`).join('\n\n')}

## IX.  最小下一步

${s.minimumNextStep}

---

### 附录 A · 引用记忆

${memMd}

### 附录 B · 回访锚点

${anchorMd}

---

*${brief.meta.aiDisclosure}*
`.trim();
}
