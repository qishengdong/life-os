#!/usr/bin/env tsx
/**
 * Longitudinal Runner — 7 天跨决策模拟 (Sivon doctrine 1.8 Layer 3)
 *
 * 使用:
 *   npm run grade:long                              # 跑全部 3 个 longitudinal personas
 *   npm run grade:long -- --personas 0              # 只跑指定 index
 *   npm run grade:long -- --label "v0.5-long"       # 加 label
 *
 * 工作流 (per persona):
 *   1. 创建唯一 swarm UID (隔离测试数据)
 *   2. 按 Day 1-7 顺序提交 decision
 *      - 每天 await fact extractor 同步完成 (确保下一天有 memory)
 *   3. 每天的 LLM call 自动注入累积的 memory
 *   4. 7 天跑完, 取整段 transcript
 *   5. 跑 longitudinal grader (5 维度)
 *   6. 同时跑 single-turn grader v3 评每天的回答 (12 维度 framework-aware)
 *   7. 输出双轨报告
 */

if (!process.env.DEEPSEEK_API_KEY) {
  console.error('❌ DEEPSEEK_API_KEY not set. Use `npm run grade:long`.');
  process.exit(1);
}

import {
  LONGITUDINAL_PERSONAS,
  type LongitudinalPersona,
  type LongitudinalDay,
} from '@/lib/grader/longitudinal-personas';
import {
  gradeLongitudinal,
  LONG_DIM_NAMES,
  type DialogueTurn,
} from '@/lib/grader/longitudinal-grader';
import { gradeResponse, DIMENSION_DISPLAY_NAMES } from '@/lib/grader/real-grader';
import { modelRouter } from '@/lib/model-router';
import { routeDecision, buildMessagesForFramework } from '@/lib/decision/router';
import { fetchUserMemory } from '@/lib/memory';
import { extractFactsFromDecision } from '@/lib/memory/fact-extractor';
import { extractCommitmentsFromDecision } from '@/lib/commitments/extractor';
import { findOrCreateUserByUid, updateUserProfile, saveDecision, getDb } from '@/lib/db';
import crypto from 'crypto';

interface DayResult {
  day: number;
  userQuestion: string;
  aiResponse: string;
  framework: string;
  memoryStatsBefore: {
    coreState: number;
    factCards: number;
    boundaries: number;
    episodes: number;
  };
  factsExtracted: number;
  durationMs: number;
}

interface PersonaLongResult {
  persona: LongitudinalPersona;
  dayResults: DayResult[];
  longitudinalScores?: any;
  perDayScores?: any[];
  error?: string;
  durationMs: number;
}

async function runDay(
  persona: LongitudinalPersona,
  day: LongitudinalDay,
  userId: number
): Promise<DayResult> {
  const startTime = Date.now();

  // 拉当前 memory state
  const memoryBefore = fetchUserMemory(userId);

  // Route + build messages (注入累积 memory)
  const route = await routeDecision(day.decision);
  const input = {
    birthDate: persona.birthDate,
    gender: persona.gender,
    decision: day.decision,
  };
  const messages = await buildMessagesForFramework(route.framework, input, memoryBefore);

  // 调 LLM
  const response = await modelRouter.complete({
    messages,
    provider: 'deepseek',
    temperature: 0.7,
    maxTokens: 4000,
  });

  // 持久化 decision
  const decisionId = saveDecision({
    userId,
    question: day.decision,
    aiResponse: response.content,
    modelUsed: `${response.provider}/${response.model}`,
    framework: route.framework,
    tokensInput: response.usage?.prompt_tokens,
    tokensOutput: response.usage?.completion_tokens,
  });

  // **同步**抽 facts (longitudinal 必须保证下一天有 memory)
  await extractFactsFromDecision({
    userId,
    decisionId,
    userQuestion: day.decision,
    aiResponse: response.content,
  });

  // 同步抽 commitments
  await extractCommitmentsFromDecision({
    userId,
    decisionId,
    aiResponse: response.content,
  });

  // 拉抽完 fact 后的 memory
  const memoryAfter = fetchUserMemory(userId);
  const factsExtracted = memoryAfter.stats.totalCards - memoryBefore.stats.totalCards;

  return {
    day: day.day,
    userQuestion: day.decision,
    aiResponse: response.content,
    framework: route.framework,
    memoryStatsBefore: {
      coreState: memoryBefore.coreState.length,
      factCards: memoryBefore.factual.length,
      boundaries: memoryBefore.boundary.length,
      episodes: memoryBefore.episodic.length,
    },
    factsExtracted,
    durationMs: Date.now() - startTime,
  };
}

async function runPersonaLong(persona: LongitudinalPersona): Promise<PersonaLongResult> {
  const totalStart = Date.now();
  // 隔离 UID
  const longUid = `long-${crypto.createHash('md5').update(persona.id).digest('hex').slice(0, 12)}`;
  const paddedUid = `${longUid.slice(0, 8)}-${longUid.slice(8, 12)}-0000-0000-000000000000`;
  const userId = findOrCreateUserByUid(paddedUid);
  updateUserProfile(userId, { birthDate: persona.birthDate, gender: persona.gender });

  // 清理该用户先前 longitudinal 数据 (保证可重跑)
  const db = getDb();
  db.prepare('DELETE FROM decisions WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM relationship_memory_cards WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM user_core_state WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM life_os_commitments WHERE user_id = ?').run(userId);

  const dayResults: DayResult[] = [];
  for (const day of persona.days) {
    process.stdout.write(`    Day ${day.day} ...`);
    try {
      const result = await runDay(persona, day, userId);
      dayResults.push(result);
      const before = result.memoryStatsBefore;
      const memSummary = `(${before.coreState}核心+${before.factCards}事实+${before.boundaries}边界+${before.episodes}事件 → +${result.factsExtracted})`;
      console.log(
        ` ✅  ${result.framework.padEnd(20)} ${memSummary}  ${(result.durationMs / 1000).toFixed(1)}s`
      );
    } catch (e: any) {
      console.log(` ❌ ${e.message}`);
      return {
        persona,
        dayResults,
        error: e.message,
        durationMs: Date.now() - totalStart,
      };
    }
    // 防 rate limit
    await new Promise((r) => setTimeout(r, 1000));
  }

  // ===== Longitudinal grading =====
  console.log(`    ✦ Longitudinal grader (5 dims)...`);
  let longitudinalScores;
  try {
    const turns: DialogueTurn[] = dayResults.map((d) => ({
      day: d.day,
      userQuestion: d.userQuestion,
      aiResponse: d.aiResponse,
    }));
    longitudinalScores = await gradeLongitudinal({
      personaScenario: persona.scenario,
      turns,
    });
    console.log(`      avg ${longitudinalScores.avgScore.toFixed(2)}/5 ${longitudinalScores.isPassing ? '✅' : '🔴'}`);
  } catch (e: any) {
    console.log(`      ❌ ${e.message}`);
  }

  // ===== Per-day grading (V3 framework-aware) =====
  console.log(`    ✦ Per-day grader (single-turn v3)...`);
  const perDayScores: any[] = [];
  for (const dr of dayResults) {
    try {
      const scores = await gradeResponse({
        decisionQuestion: dr.userQuestion,
        aiResponse: dr.aiResponse,
        hasMemory: dr.memoryStatsBefore.factCards > 0 || dr.memoryStatsBefore.coreState > 0,
        framework: dr.framework as any,
      });
      perDayScores.push({ day: dr.day, ...scores });
    } catch (e: any) {
      console.log(`      Day ${dr.day} grader err: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  const avgDayScore =
    perDayScores.reduce((sum, s) => sum + s.avgScore, 0) / Math.max(1, perDayScores.length);
  console.log(`      avg ${avgDayScore.toFixed(2)}/5 across ${perDayScores.length} days`);

  return {
    persona,
    dayResults,
    longitudinalScores,
    perDayScores,
    durationMs: Date.now() - totalStart,
  };
}

async function main() {
  const args = process.argv.slice(2);
  let label = `long-${new Date().toISOString().slice(0, 16)}`;
  let personasToRun: LongitudinalPersona[] = LONGITUDINAL_PERSONAS;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--label' && args[i + 1]) {
      label = args[++i];
    } else if (args[i] === '--personas' && args[i + 1]) {
      const indices = args[++i].split(',').map((x) => parseInt(x.trim()));
      personasToRun = indices.map((idx) => LONGITUDINAL_PERSONAS[idx]).filter(Boolean);
    }
  }

  console.log(`\n🤖 Life OS Longitudinal Simulator — ${label}`);
  console.log(`Personas: ${personasToRun.length} × ~7 days each\n`);

  const results: PersonaLongResult[] = [];
  for (let i = 0; i < personasToRun.length; i++) {
    const p = personasToRun[i];
    console.log(`\n  [${i + 1}/${personasToRun.length}] ${p.scenario}`);
    const result = await runPersonaLong(p);
    results.push(result);
    console.log(`    Done in ${(result.durationMs / 1000).toFixed(1)}s`);
  }

  // ============================================================
  // Summary
  // ============================================================
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 Longitudinal Summary | ${label}`);
  console.log('='.repeat(70));

  // Longitudinal grader 维度均值
  const longDimAgg: Record<string, number[]> = {};
  for (const r of results) {
    if (r.longitudinalScores) {
      for (const s of r.longitudinalScores.scores) {
        if (!longDimAgg[s.dimension]) longDimAgg[s.dimension] = [];
        longDimAgg[s.dimension].push(s.score);
      }
    }
  }

  console.log(`\n## 跨 Turn 行为评估 (Longitudinal Grader 5 dims)`);
  console.log(`-`.repeat(70));
  for (const [dim, scores] of Object.entries(longDimAgg)) {
    const mean = scores.reduce((s, x) => s + x, 0) / scores.length;
    const min = Math.min(...scores);
    const flag = mean < 3.0 ? '🔴' : mean < 4.0 ? '🟡' : '🟢';
    const name = LONG_DIM_NAMES[dim as keyof typeof LONG_DIM_NAMES] || dim;
    console.log(`  ${flag} ${name.padEnd(20)}  ${mean.toFixed(2)}  (min ${min.toFixed(1)})`);
  }

  // Per-day single-turn 维度均值 (12 维度)
  const dayDimAgg: Record<string, number[]> = {};
  for (const r of results) {
    if (r.perDayScores) {
      for (const dayScore of r.perDayScores) {
        for (const s of dayScore.scores || []) {
          if (!dayDimAgg[s.dimension]) dayDimAgg[s.dimension] = [];
          dayDimAgg[s.dimension].push(s.score);
        }
      }
    }
  }

  console.log(`\n## 每日单 turn 评估 (Real Grader v3, 12 dims, framework-aware)`);
  console.log(`-`.repeat(70));
  for (const [dim, scores] of Object.entries(dayDimAgg)) {
    const mean = scores.reduce((s, x) => s + x, 0) / scores.length;
    const min = Math.min(...scores);
    const flag = mean < 3.0 ? '🔴' : mean < 4.0 ? '🟡' : '🟢';
    const name = (DIMENSION_DISPLAY_NAMES as Record<string, string>)[dim] || dim;
    console.log(`  ${flag} ${name.padEnd(20)}  ${mean.toFixed(2)}  (min ${min.toFixed(1)})`);
  }

  // Per-persona summary
  console.log(`\n## Per-persona`);
  console.log(`-`.repeat(70));
  for (const r of results) {
    const longAvg = r.longitudinalScores?.avgScore?.toFixed(2) || 'N/A';
    const dayAvg = r.perDayScores
      ? (r.perDayScores.reduce((s, x) => s + x.avgScore, 0) / r.perDayScores.length).toFixed(2)
      : 'N/A';
    console.log(`  · ${r.persona.scenario.padEnd(28)}  Long ${longAvg}  Day-avg ${dayAvg}`);
  }

  console.log(`\n完成. \n`);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
