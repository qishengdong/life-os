#!/usr/bin/env tsx
/**
 * Synthetic Swarm Runner v2
 *
 * 升级:
 *   - 27 personas (vs v1 7)
 *   - Adversarial mode (--adversarial)
 *   - Distribution view (p10/p50/p90, 不只 mean)
 *   - 12 dimensions (vs v1 7)
 *   - Per-category breakdown
 *
 * 使用:
 *   npm run grade:swarm                                # 跑 27 normal personas
 *   npm run grade:swarm -- --adversarial               # 跑 7 adversarial probes
 *   npm run grade:swarm -- --personas 0,2,5            # 指定 index
 *   npm run grade:swarm -- --label "v1.0"             # 加 label
 *   npm run grade:swarm -- --concurrent 3             # 并发数 (默认 1, 防 rate limit)
 */

if (!process.env.DEEPSEEK_API_KEY) {
  console.error('❌ DEEPSEEK_API_KEY not set. Use `npm run grade:swarm`.');
  process.exit(1);
}

import { PERSONAS, ADVERSARIAL_PROBES, type Persona } from '@/lib/grader/personas';
import {
  gradeResponse,
  DIMENSION_DISPLAY_NAMES,
  type GradingDimension,
} from '@/lib/grader/real-grader';
import { modelRouter } from '@/lib/model-router';
import { routeDecision, buildMessagesForFramework } from '@/lib/decision/router';
import { fetchUserMemory } from '@/lib/memory';
import { findOrCreateUserByUid, updateUserProfile, saveDecision, getDb } from '@/lib/db';
import crypto from 'crypto';

interface PersonaResult {
  persona: Persona;
  framework: string;
  frameworkExpected: string;
  frameworkMatch: boolean;
  routerVersion?: string;
  aiResponse: string;
  responseLength: number;
  durationMs: number;
  scores?: any;
  error?: string;
}

async function runSinglePersona(persona: Persona, isAdversarial: boolean): Promise<PersonaResult> {
  const startTime = Date.now();
  const swarmUid = `swarm-${crypto.createHash('md5').update(persona.id).digest('hex').slice(0, 12)}`;
  const paddedUid = `${swarmUid.slice(0, 8)}-${swarmUid.slice(8, 12)}-0000-0000-000000000000`;
  const userId = findOrCreateUserByUid(paddedUid);
  updateUserProfile(userId, { birthDate: persona.birthDate, gender: persona.gender });

  const route = await routeDecision(persona.decision);
  const memory = fetchUserMemory(userId);
  const messages = await buildMessagesForFramework(route.framework, persona, memory);

  let aiResponse = '';
  try {
    const response = await modelRouter.complete({
      messages,
      provider: 'deepseek',
      temperature: 0.7,
      maxTokens: 4000,
    });
    aiResponse = response.content;
    saveDecision({
      userId,
      question: persona.decision,
      aiResponse,
      modelUsed: `${response.provider}/${response.model}`,
      framework: route.framework,
      tokensInput: response.usage?.prompt_tokens,
      tokensOutput: response.usage?.completion_tokens,
    });
  } catch (e: any) {
    return {
      persona,
      framework: route.framework,
      frameworkExpected: persona.expectedFramework,
      frameworkMatch: route.framework === persona.expectedFramework,
      routerVersion: route.routerVersion,
      aiResponse: '',
      responseLength: 0,
      durationMs: Date.now() - startTime,
      error: e.message,
    };
  }

  await new Promise((r) => setTimeout(r, 500));

  let scores;
  try {
    scores = await gradeResponse({
      decisionQuestion: persona.decision,
      aiResponse,
      hasMemory: false,
      isAdversarial,
    });
  } catch (e: any) {
    return {
      persona,
      framework: route.framework,
      frameworkExpected: persona.expectedFramework,
      frameworkMatch: route.framework === persona.expectedFramework,
      routerVersion: route.routerVersion,
      aiResponse,
      responseLength: aiResponse.length,
      durationMs: Date.now() - startTime,
      error: `Grader: ${e.message}`,
    };
  }

  return {
    persona,
    framework: route.framework,
    frameworkExpected: persona.expectedFramework,
    frameworkMatch: route.framework === persona.expectedFramework,
    routerVersion: route.routerVersion,
    aiResponse,
    responseLength: aiResponse.length,
    durationMs: Date.now() - startTime,
    scores,
  };
}

// ==========================================
// 并发控制 (defaults to sequential to avoid rate limits)
// ==========================================
async function runWithConcurrency<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency: number,
  onComplete: (result: R, index: number) => void
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIdx = 0;

  async function worker() {
    while (true) {
      const i = nextIdx++;
      if (i >= items.length) return;
      const result = await fn(items[i], i);
      results[i] = result;
      onComplete(result, i);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

// ==========================================
// Distribution helpers
// ==========================================
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.floor((sorted.length - 1) * p);
  return sorted[idx];
}

// ==========================================
// Main
// ==========================================
async function main() {
  const args = process.argv.slice(2);
  let label = `swarm-${new Date().toISOString().slice(0, 16)}`;
  let isAdversarial = false;
  let concurrency = 1;
  let personasToRun: Persona[] = PERSONAS;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--label' && args[i + 1]) { label = args[++i]; }
    else if (args[i] === '--adversarial') { isAdversarial = true; personasToRun = ADVERSARIAL_PROBES; }
    else if (args[i] === '--concurrent' && args[i + 1]) { concurrency = parseInt(args[++i]); }
    else if (args[i] === '--personas' && args[i + 1]) {
      const indices = args[++i].split(',').map((x) => parseInt(x.trim()));
      const pool = isAdversarial ? ADVERSARIAL_PROBES : PERSONAS;
      personasToRun = indices.map((idx) => pool[idx]).filter(Boolean);
    }
  }

  console.log(`\n🤖 Life OS Synthetic Swarm v2 — ${label}`);
  console.log(`Mode: ${isAdversarial ? '🛡️  ADVERSARIAL' : '👥 normal personas'}`);
  console.log(`Personas: ${personasToRun.length} | Concurrency: ${concurrency}\n`);

  const db = getDb();
  const runResult = db
    .prepare(`INSERT INTO grader_runs (run_label, persona_count, mode) VALUES (?, ?, ?)`)
    .run(label, personasToRun.length, isAdversarial ? 'synthetic' : 'synthetic');
  const runId = runResult.lastInsertRowid as number;

  const startedAt = Date.now();

  const results = await runWithConcurrency(
    personasToRun,
    (p) => runSinglePersona(p, isAdversarial),
    concurrency,
    (result, i) => {
      const idx = `[${i + 1}/${personasToRun.length}]`;
      if (result.error) {
        console.log(`  ${idx} ❌ ${result.persona.scenario}: ${result.error}`);
      } else if (result.scores) {
        const avg = result.scores.avgScore.toFixed(2);
        const status = result.scores.isPassing ? '✅' : '🔴';
        const fmMatch = result.frameworkMatch ? '✓' : `✗(${result.framework})`;
        const rv = result.routerVersion === 'llm-classifier' ? '[LLM]' : '';
        console.log(
          `  ${idx} ${status} ${result.persona.scenario.padEnd(28)} avg ${avg}/5  fmw ${fmMatch} ${rv}  ${(result.durationMs / 1000).toFixed(1)}s`
        );

        const stmt = db.prepare(
          `INSERT INTO grader_scores (run_id, persona, decision_question, ai_response, dimension, score, reasoning)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        );
        for (const s of result.scores.scores) {
          stmt.run(
            runId,
            result.persona.id,
            result.persona.decision,
            result.aiResponse,
            s.dimension,
            s.score,
            s.reasoning
          );
        }
      }
    }
  );

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
  const validResults = results.filter((r) => r.scores);

  const totalScore = validResults.reduce((sum, r) => sum + r.scores.totalScore, 0);
  const avgScore = validResults.reduce((sum, r) => sum + r.scores.avgScore, 0) / Math.max(1, validResults.length);

  db.prepare(`UPDATE grader_runs SET total_score = ?, avg_score = ? WHERE id = ?`).run(
    totalScore,
    avgScore,
    runId
  );

  // ==================
  // Summary
  // ==================
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Summary | Run ${runId} | ${label} | ${elapsed}s total`);
  console.log('='.repeat(60));
  console.log(`Avg score: ${avgScore.toFixed(2)} / 5`);

  // ==================
  // Per-dimension (mean + distribution)
  // ==================
  const dimAgg: Record<string, number[]> = {};
  for (const r of validResults) {
    for (const s of r.scores.scores) {
      if (!dimAgg[s.dimension]) dimAgg[s.dimension] = [];
      dimAgg[s.dimension].push(s.score);
    }
  }

  console.log(`\nPer-dimension (mean | p10 | p50 | p90 | min):`);
  console.log(`-`.repeat(70));
  for (const [dim, scores] of Object.entries(dimAgg)) {
    const sorted = [...scores].sort((a, b) => a - b);
    const mean = scores.reduce((s, x) => s + x, 0) / scores.length;
    const p10 = percentile(sorted, 0.1);
    const p50 = percentile(sorted, 0.5);
    const p90 = percentile(sorted, 0.9);
    const min = sorted[0];
    const flag = mean < 3.0 ? '🔴' : mean < 4.0 ? '🟡' : '🟢';
    const name = DIMENSION_DISPLAY_NAMES[dim as GradingDimension] || dim;
    console.log(
      `  ${flag} ${name.padEnd(20)}  ${mean.toFixed(2)}  |  ${p10.toFixed(1)}  ${p50.toFixed(1)}  ${p90.toFixed(1)}  |  min ${min.toFixed(1)}`
    );
  }

  // ==================
  // Per-category breakdown
  // ==================
  const catAgg: Record<string, number[]> = {};
  for (const r of validResults) {
    const cat = r.persona.category;
    if (!catAgg[cat]) catAgg[cat] = [];
    catAgg[cat].push(r.scores.avgScore);
  }
  console.log(`\nPer-category avg score:`);
  console.log(`-`.repeat(70));
  for (const [cat, scores] of Object.entries(catAgg)) {
    const mean = scores.reduce((s, x) => s + x, 0) / scores.length;
    const flag = mean < 3.0 ? '🔴' : mean < 4.0 ? '🟡' : '🟢';
    console.log(
      `  ${flag} ${cat.padEnd(20)}  ${mean.toFixed(2)}  (${scores.length} personas)`
    );
  }

  // ==================
  // Framework routing accuracy
  // ==================
  const fwMatch = results.filter((r) => r.frameworkMatch).length;
  console.log(`\nFramework routing accuracy: ${fwMatch}/${results.length} = ${((fwMatch / results.length) * 100).toFixed(0)}%`);

  // 失败 case (any dimension < 3.0)
  const failed = validResults.filter((r) => !r.scores.isPassing);
  if (failed.length > 0) {
    console.log(`\n⚠️  ${failed.length} personas failed (任何维度 < 3.0):`);
    for (const f of failed) {
      console.log(`  · ${f.persona.scenario}`);
      for (const s of f.scores.scores) {
        if (s.score < 3.0) {
          console.log(`      🔴 ${s.dimension}: ${s.score}/5 — ${s.reasoning}`);
        }
      }
    }
  }

  console.log(`\nDB: sqlite3 data/life-os.db "SELECT * FROM grader_scores WHERE run_id = ${runId}"`);
  console.log(`完成. \n`);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
