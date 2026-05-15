/**
 * AI Native Test v3 · Runner harness
 *
 * 一个 case 走 3-layer judge, 结果存表.
 * Pre-launch battery: 全 40 × 12 personas (实际 40 个 scenario 已指定 persona, 不需要 cartesian).
 * Daily fleet: 抽 10-15 random.
 *
 * AI 输出由哪个 endpoint 产? 取决于 stage:
 *   - onboarding → trigger /api/onboarding (POST)
 *   - decision → /api/decision/brief (POST)
 *   - pulse → /api/pulse (POST)
 *   - letter → /api/letters (POST)
 *   - outcome → /api/outcomes (POST)
 *
 * 但运行测试 inline 我们直接调 lib (跳过 API 层 + cookie 等无关基础设施).
 */

import { getDb } from '@/lib/db';
import { runLayerA } from './layer-a';
import { runLayerC } from './layer-c';
import type { TrapScenario, ProductStage } from './scenarios-v3';
import { SCENARIOS_V3 } from './scenarios-v3';
import { getPersonaById, type PersonaV3 } from './personas-v3';
import { generateBrief } from '@/lib/decision/brief-pipeline';
import { renderBriefMarkdown } from '@/lib/decision/brief-schema';
import { personaToUserMemoryContext } from './persona-to-memory';

export interface RunOptions {
  mode: 'layer_a_only' | 'layer_ac' | 'layer_abc'; // layer_b 暂不实现
  label?: string;
  /** 仅跑这些 scenario IDs (undefined = 跑全部) */
  filterScenarioIds?: string[];
  /** 仅跑这些 traps */
  filterTraps?: string[];
  /** 仅跑这些 stages */
  filterStages?: ProductStage[];
  /** Daily fleet 用 · 随机抽 N 个 */
  sampleSize?: number;
}

export interface RunSummary {
  runId: number;
  totalCases: number;
  /** 真跑且 Layer A 通过 · 不含 skipped */
  passedA: number;
  /** 真跑且 Layer C 通过 · 不含 skipped */
  passedC: number;
  /** Stub stage 跳过的数量 (onboarding/pulse/letter/outcome 等未实现) */
  skipped: number;
  tokensUsed: number;
  durationMs: number;
  failures: Array<{
    scenarioId: string;
    layerAFails?: string[];
    layerCFocusAvg?: number;
  }>;
  /** 完整结果 · 含 AI output · 供 admin UI 立刻看 (绕过 Vercel /tmp 实例隔离) */
  results?: Array<{
    scenarioId: string;
    personaId: string;
    trapType: string;
    stage: string;
    /** 'skipped' = stub 未跑 · 'pass' / 'fail' = 真跑结果 */
    status: 'pass' | 'fail' | 'skipped';
    layerAFails: Array<{ reason: string; matched?: string; detail?: string }>;
    layerCFocusAvg?: number;
    layerCComment?: string;
    aiOutput: string;
  }>;
}

// ============================================================================
// 主入口
// ============================================================================
export async function runTestBattery(opts: RunOptions): Promise<RunSummary> {
  const t0 = Date.now();
  const db = getDb();

  // 1. 选 scenarios
  let scenarios = SCENARIOS_V3.slice();
  if (opts.filterScenarioIds) {
    const set = new Set(opts.filterScenarioIds);
    scenarios = scenarios.filter((s) => set.has(s.id));
  }
  if (opts.filterTraps) {
    const set = new Set(opts.filterTraps);
    scenarios = scenarios.filter((s) => set.has(s.trap));
  }
  if (opts.filterStages) {
    const set = new Set(opts.filterStages);
    scenarios = scenarios.filter((s) => set.has(s.stage));
  }
  if (opts.sampleSize && opts.sampleSize < scenarios.length) {
    scenarios = shuffle(scenarios).slice(0, opts.sampleSize);
  }

  // 2. 起 run 记录
  const runRes = db
    .prepare(
      `INSERT INTO test_runs (label, mode, total_cases) VALUES (?, ?, ?)`,
    )
    .run(opts.label || 'manual', opts.mode, scenarios.length);
  const runId = runRes.lastInsertRowid as number;

  let passedA = 0;
  let passedC = 0;
  let skipped = 0;
  let tokensUsed = 0;
  const failures: RunSummary['failures'] = [];
  const inlineResults: NonNullable<RunSummary['results']> = [];

  // 3. 跑每个 scenario
  for (const scenario of scenarios) {
    const persona = scenario.personaId ? getPersonaById(scenario.personaId) : undefined;
    if (!persona) {
      console.warn(`[test runner] persona ${scenario.personaId} not found, skipping ${scenario.id}`);
      continue;
    }

    let aiOutput = '';
    try {
      aiOutput = await runScenarioStage(scenario, persona);
    } catch (e: any) {
      aiOutput = `(scenario run failed: ${e.message})`;
    }

    // Stub stage 检 → 标 skipped, 不走 Layer A/C
    const isStub = aiOutput.startsWith(STAGE_STUB_MARKER);
    if (isStub) {
      skipped++;
      inlineResults.push({
        scenarioId: scenario.id,
        personaId: scenario.personaId || 'unknown',
        trapType: scenario.trap,
        stage: scenario.stage,
        status: 'skipped',
        layerAFails: [],
        aiOutput: aiOutput.slice(0, 200),
      });
      // 仍写 DB 以 audit (Layer A pass=0, fails=[{reason:'stage_stub'}])
      db.prepare(
        `INSERT INTO test_results (
          run_id, scenario_id, persona_id, trap_type, stage,
          ai_output, layer_a_pass, layer_a_fails
        ) VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
      ).run(
        runId, scenario.id, scenario.personaId || 'unknown',
        scenario.trap, scenario.stage,
        aiOutput.slice(0, 1000),
        JSON.stringify([{ reason: 'stage_stub_skipped' }]),
      );
      continue;
    }

    // Layer A 必跑
    const a = runLayerA({ scenario, aiOutput, persona });
    if (a.pass) passedA++;
    else
      failures.push({
        scenarioId: scenario.id,
        layerAFails: a.fails.map((f) => `${f.reason}${f.matched ? `:${f.matched}` : ''}`),
      });

    // Layer C 抽样跑 (mode=layer_ac 全跑, mode=layer_a_only 不跑)
    let cResult: any = null;
    if (opts.mode === 'layer_ac' || opts.mode === 'layer_abc') {
      cResult = await runLayerC({ scenario, aiOutput, persona });
      if (cResult.pass) passedC++;
      tokensUsed += cResult.tokensUsed;
      if (!cResult.pass && a.pass) {
        failures.push({
          scenarioId: scenario.id,
          layerCFocusAvg: cResult.focusAvg,
        });
      }
    }

    // 4. 写 test_results (DB · 同 instance 才看得到)
    db.prepare(
      `INSERT INTO test_results (
        run_id, scenario_id, persona_id, trap_type, stage,
        ai_output, layer_a_pass, layer_a_fails,
        layer_c_pass, layer_c_focus_avg, layer_c_overall_avg,
        layer_c_scores, layer_c_comment
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      runId,
      scenario.id,
      scenario.personaId || 'unknown',
      scenario.trap,
      scenario.stage,
      aiOutput.slice(0, 8000),
      a.pass ? 1 : 0,
      JSON.stringify(a.fails),
      cResult ? (cResult.pass ? 1 : 0) : null,
      cResult?.focusAvg ?? null,
      cResult?.overallAvg ?? null,
      cResult ? JSON.stringify(cResult.scoresByDimension) : null,
      cResult?.comment || null,
    );

    // 5. 也存 inline · response 直接带, 绕过 Vercel /tmp 实例隔离
    inlineResults.push({
      scenarioId: scenario.id,
      personaId: scenario.personaId || 'unknown',
      trapType: scenario.trap,
      stage: scenario.stage,
      status: a.pass && (!cResult || cResult.pass) ? 'pass' : 'fail',
      layerAFails: a.fails,
      layerCFocusAvg: cResult?.focusAvg,
      layerCComment: cResult?.comment,
      aiOutput: aiOutput.slice(0, 4000),
    });
  }

  // 5. 更新 run 总结
  const durationMs = Date.now() - t0;
  db.prepare(
    `UPDATE test_runs SET passed_a = ?, passed_c = ?, tokens_used = ?, duration_ms = ? WHERE id = ?`,
  ).run(passedA, passedC, tokensUsed, durationMs, runId);

  return {
    runId,
    totalCases: scenarios.length,
    passedA,
    passedC,
    skipped,
    tokensUsed,
    durationMs,
    failures,
    results: inlineResults,
  };
}

// ============================================================================
// 各 stage 触发 AI 输出
// ============================================================================

async function runScenarioStage(scenario: TrapScenario, persona: PersonaV3): Promise<string> {
  switch (scenario.stage) {
    case 'decision':
      return await runDecisionStage(scenario, persona);
    case 'onboarding':
      return await runOnboardingStage(scenario, persona);
    case 'pulse':
      return await runPulseStage(scenario, persona);
    case 'letter':
      return await runLetterStage(scenario, persona);
    case 'outcome':
      return await runOutcomeStage(scenario, persona);
    default:
      return '(unknown stage)';
  }
}

async function runDecisionStage(scenario: TrapScenario, persona: PersonaV3): Promise<string> {
  // 注入 synthetic memory · 绕过 fetchUserMemory DB 查找 (user_id=-1 不存在)
  const injectedMemory = personaToUserMemoryContext(persona);
  const result = await generateBrief({
    userId: -1, // synthetic
    birthDate: persona.birthDate,
    gender: persona.gender === 'F' ? 'female' : 'male',
    decision: scenario.userInput,
    displayName: persona.name,
    injectedMemory,
  });
  if (result.safetyShortCircuit) {
    return `(safety short-circuit: ${result.safetyShortCircuit.response})`;
  }
  if (!result.success || !result.brief) {
    return `(brief generation failed: ${result.error})`;
  }
  return renderBriefMarkdown(result.brief);
}

/** Stub stage marker. Runner detects 并 mark scenario as "skipped" 而非 false pass. */
export const STAGE_STUB_MARKER = '__STUB_SKIP__';

async function runOnboardingStage(_scenario: TrapScenario, _persona: PersonaV3): Promise<string> {
  // V3.1 待 ship: synthetic in-memory onboarding (不污染 DB)
  return `${STAGE_STUB_MARKER}: onboarding stage not yet implemented in test harness`;
}

async function runPulseStage(_scenario: TrapScenario, _persona: PersonaV3): Promise<string> {
  return `${STAGE_STUB_MARKER}: pulse stage not yet implemented`;
}

async function runLetterStage(_scenario: TrapScenario, _persona: PersonaV3): Promise<string> {
  return `${STAGE_STUB_MARKER}: letter stage not yet implemented`;
}

async function runOutcomeStage(_scenario: TrapScenario, _persona: PersonaV3): Promise<string> {
  return `${STAGE_STUB_MARKER}: outcome stage not yet implemented`;
}

// ============================================================================
// helpers
// ============================================================================

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
