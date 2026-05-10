#!/usr/bin/env tsx
/**
 * Synthetic Swarm Runner
 *
 * 跑全部 7 个 persona, 让 Life OS 给每个回答, 然后 Real Grader 打分.
 * 输出: JSON 报告 + DB 记录 (grader_runs / grader_scores).
 *
 * 使用:
 *   npm run grade:swarm                      # 跑全部 7 个
 *   npm run grade:swarm -- --personas 1,2    # 只跑指定 index
 *   npm run grade:swarm -- --label "v1.2"   # 给本次 run 加 label
 *
 * Sivon doctrine 1.8: ship 后 30min 内必跑 swarm, 不等真用户当 QA.
 *
 * Env: 通过 `tsx --env-file=.env.local` 预加载, 必须先于其他 imports.
 */

if (!process.env.DEEPSEEK_API_KEY) {
  console.error('❌ DEEPSEEK_API_KEY not set. Run via `npm run grade:swarm` (uses --env-file).');
  process.exit(1);
}

import { PERSONAS, type Persona } from '@/lib/grader/personas';
import { gradeResponse, DIMENSION_DISPLAY_NAMES } from '@/lib/grader/real-grader';
import { modelRouter } from '@/lib/model-router';
import {
  detectFramework,
  buildMessagesForFramework,
  FRAMEWORK_DISPLAY_NAMES,
} from '@/lib/decision/router';
import { fetchUserMemory } from '@/lib/memory';
import { findOrCreateUserByUid, updateUserProfile, saveDecision, getDb } from '@/lib/db';
import crypto from 'crypto';

interface PersonaResult {
  persona: Persona;
  framework: string;
  frameworkExpected: string;
  frameworkMatch: boolean;
  aiResponse: string;
  responseLength: number;
  durationMs: number;
  scores?: any;
  error?: string;
}

async function runSinglePersona(persona: Persona): Promise<PersonaResult> {
  const startTime = Date.now();

  // 给 swarm 用一个隔离的虚拟 UID, 不污染真实用户数据
  const swarmUid = `swarm-${crypto.createHash('md5').update(persona.id).digest('hex').slice(0, 12)}`;
  // pad 到完整 UUID 格式
  const paddedUid = `${swarmUid.slice(0, 8)}-${swarmUid.slice(8, 12)}-0000-0000-000000000000`;
  const userId = findOrCreateUserByUid(paddedUid);
  updateUserProfile(userId, { birthDate: persona.birthDate, gender: persona.gender });

  // 框架路由
  const route = detectFramework(persona.decision);
  const memory = fetchUserMemory(userId);
  const messages = buildMessagesForFramework(route.framework, persona, memory);

  // 调用 LLM
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
      aiResponse: '',
      responseLength: 0,
      durationMs: Date.now() - startTime,
      error: e.message,
    };
  }

  // 等 1 秒避免触发 rate limit
  await new Promise((r) => setTimeout(r, 1000));

  // 跑 grader
  let scores;
  try {
    const result = await gradeResponse({
      decisionQuestion: persona.decision,
      aiResponse,
      hasMemory: false, // swarm 是新用户, 没 prior memory
    });
    scores = result;
  } catch (e: any) {
    return {
      persona,
      framework: route.framework,
      frameworkExpected: persona.expectedFramework,
      frameworkMatch: route.framework === persona.expectedFramework,
      aiResponse,
      responseLength: aiResponse.length,
      durationMs: Date.now() - startTime,
      error: `Grader failed: ${e.message}`,
    };
  }

  return {
    persona,
    framework: route.framework,
    frameworkExpected: persona.expectedFramework,
    frameworkMatch: route.framework === persona.expectedFramework,
    aiResponse,
    responseLength: aiResponse.length,
    durationMs: Date.now() - startTime,
    scores,
  };
}

async function main() {
  const args = process.argv.slice(2);
  let label = `swarm-${new Date().toISOString().slice(0, 16)}`;
  let personasToRun = PERSONAS;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--label' && args[i + 1]) {
      label = args[i + 1];
      i++;
    } else if (args[i] === '--personas' && args[i + 1]) {
      const indices = args[i + 1].split(',').map((x) => parseInt(x.trim()));
      personasToRun = indices.map((idx) => PERSONAS[idx]).filter(Boolean);
      i++;
    }
  }

  console.log(`\n🤖 Life OS Synthetic Swarm — ${label}`);
  console.log(`Running ${personasToRun.length} personas...\n`);

  // 在 grader_runs 表插入一条 run record
  const db = getDb();
  const runResult = db
    .prepare(
      `INSERT INTO grader_runs (run_label, persona_count, mode) VALUES (?, ?, 'synthetic')`
    )
    .run(label, personasToRun.length);
  const runId = runResult.lastInsertRowid as number;

  const results: PersonaResult[] = [];
  for (let i = 0; i < personasToRun.length; i++) {
    const p = personasToRun[i];
    process.stdout.write(`  [${i + 1}/${personasToRun.length}] ${p.scenario}... `);
    const result = await runSinglePersona(p);
    results.push(result);

    if (result.error) {
      console.log(`❌ ${result.error}`);
    } else if (result.scores) {
      const avg = result.scores.avgScore.toFixed(2);
      const status = result.scores.isPassing ? '✅' : '❌';
      console.log(`${status} avg ${avg}/5  framework ${result.framework === p.expectedFramework ? '✓' : '✗ (got ' + result.framework + ')'}  ${(result.durationMs / 1000).toFixed(1)}s`);

      // 写 scores
      const stmt = db.prepare(
        `INSERT INTO grader_scores (run_id, persona, decision_question, ai_response, dimension, score, reasoning)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      );
      for (const s of result.scores.scores) {
        stmt.run(
          runId,
          p.id,
          p.decision,
          result.aiResponse,
          s.dimension,
          s.score,
          s.reasoning
        );
      }
    }
  }

  // 计算 run 总分
  const totalScore = results
    .filter((r) => r.scores)
    .reduce((sum, r) => sum + r.scores.totalScore, 0);
  const avgScore =
    results.filter((r) => r.scores).reduce((sum, r) => sum + r.scores.avgScore, 0) /
    Math.max(1, results.filter((r) => r.scores).length);

  db.prepare(
    `UPDATE grader_runs SET total_score = ?, avg_score = ? WHERE id = ?`
  ).run(totalScore, avgScore, runId);

  // 打印 summary
  console.log(`\n📊 Summary`);
  console.log(`Run ID: ${runId} | Label: ${label}`);
  console.log(`Avg score: ${avgScore.toFixed(2)} / 5`);
  console.log();

  // 维度聚合
  const dimAgg: Record<string, number[]> = {};
  for (const r of results) {
    if (r.scores) {
      for (const s of r.scores.scores) {
        if (!dimAgg[s.dimension]) dimAgg[s.dimension] = [];
        dimAgg[s.dimension].push(s.score);
      }
    }
  }
  console.log(`Per-dimension avg:`);
  for (const [dim, scores] of Object.entries(dimAgg)) {
    const avg = scores.reduce((s, x) => s + x, 0) / scores.length;
    const flag = avg < 3.0 ? '🔴' : avg < 4.0 ? '🟡' : '🟢';
    const name = DIMENSION_DISPLAY_NAMES[dim as keyof typeof DIMENSION_DISPLAY_NAMES] || dim;
    console.log(`  ${flag} ${name.padEnd(20)}  ${avg.toFixed(2)}`);
  }

  // 框架路由准确率
  const fwMatch = results.filter((r) => r.frameworkMatch).length;
  console.log(`\nFramework routing accuracy: ${fwMatch}/${results.length}`);

  // 失败的 persona
  const failed = results.filter((r) => r.scores && !r.scores.isPassing);
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

  console.log(`\nDB: 跑 \`sqlite3 data/life-os.db\` 查 grader_runs / grader_scores 表看完整结果`);
  console.log(`完成. \n`);
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
