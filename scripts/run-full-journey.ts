#!/usr/bin/env tsx
/**
 * Full Journey Runner
 *
 * 14 天单 persona 完整流程, 验证 Pulse + Decision + Memory + Brain 集成.
 *
 * 用法:
 *   npm run grade:journey
 */

if (!process.env.DEEPSEEK_API_KEY) {
  console.error('❌ DEEPSEEK_API_KEY not set');
  process.exit(1);
}

import { JOURNEY_PERSONA, type JourneyDay } from '@/lib/grader/journey-script';
import { processOnboarding } from '@/lib/onboarding/processor';
import { processPulse } from '@/lib/pulse/tagger';
import { addPulse, getUserPulseCount } from '@/lib/pulse/store';
import { modelRouter } from '@/lib/model-router';
import { routeDecision, buildMessagesForFramework, FRAMEWORK_DISPLAY_NAMES } from '@/lib/decision/router';
import { fetchUserMemory } from '@/lib/memory';
import { extractFactsFromDecision } from '@/lib/memory/fact-extractor';
import { maybeConsolidate, consolidateBrain } from '@/lib/memory/brain-consolidator';
import { findOrCreateUserByUid, saveDecision, getDb } from '@/lib/db';
import crypto from 'crypto';

interface DayResult {
  day: number;
  action: string;
  durationMs: number;
  output?: string;
  framework?: string;
  tags?: string[];
  memoryStatsBefore: {
    coreState: number;
    rmcTotal: number;
    decisions: number;
    pulses: number;
    hasBrain: boolean;
  };
  memoryStatsAfter: {
    coreState: number;
    rmcTotal: number;
    decisions: number;
    pulses: number;
    hasBrain: boolean;
  };
  expectations: string[];
  citationsInOutput?: string[]; // 决策输出里引用到的过去事
  error?: string;
}

function getMemSnapshot(userId: number) {
  const mem = fetchUserMemory(userId);
  const pulses = getUserPulseCount(userId);
  const db = getDb();
  const decisionsRow = db.prepare('SELECT COUNT(*) as n FROM decisions WHERE user_id = ?').get(userId) as { n: number };
  return {
    coreState: mem.coreState.length,
    rmcTotal: mem.stats.totalCards,
    decisions: decisionsRow.n,
    pulses,
    hasBrain: !!mem.brainContent,
  };
}

async function runDay(persona: typeof JOURNEY_PERSONA, day: JourneyDay, userId: number, userUid: string): Promise<DayResult> {
  const startTime = Date.now();
  const memBefore = getMemSnapshot(userId);

  if (day.action === 'skip') {
    return {
      day: day.day,
      action: 'skip',
      durationMs: 0,
      memoryStatsBefore: memBefore,
      memoryStatsAfter: memBefore,
      expectations: day.expectations,
    };
  }

  try {
    if (day.action === 'onboarding') {
      const result = await processOnboarding(userUid, day.onboarding || []);
      return {
        day: day.day,
        action: 'onboarding',
        durationMs: Date.now() - startTime,
        output: `core_state:${result.coreStateInserted} cards:${result.cardsInserted} brain:${result.brainCharCount}`,
        memoryStatsBefore: memBefore,
        memoryStatsAfter: getMemSnapshot(userId),
        expectations: day.expectations,
      };
    }

    if (day.action === 'pulse') {
      const result = await processPulse({
        userId,
        questionId: day.pulseQuestionId!,
        content: day.pulseContent!,
      });
      addPulse({
        userId,
        questionId: day.pulseQuestionId!,
        content: day.pulseContent!,
        tags: result.tags,
        aiResponse: result.aiResponse,
        rmcEpisodicId: result.rmcEpisodicId,
      });
      // 异步 brain consolidate (这次同步等以观察)
      await maybeConsolidate(userId);
      return {
        day: day.day,
        action: 'pulse',
        durationMs: Date.now() - startTime,
        output: result.aiResponse,
        tags: result.tags,
        memoryStatsBefore: memBefore,
        memoryStatsAfter: getMemSnapshot(userId),
        expectations: day.expectations,
      };
    }

    if (day.action === 'decision') {
      const route = await routeDecision(day.decisionContent!);
      const memory = fetchUserMemory(userId);
      const messages = await buildMessagesForFramework(route.framework, {
        birthDate: persona.birthDate,
        gender: persona.gender,
        decision: day.decisionContent!,
      }, memory);

      const response = await modelRouter.complete({
        messages,
        provider: 'deepseek',
        temperature: 0.7,
        maxTokens: 4000,
      });

      const decisionId = saveDecision({
        userId,
        question: day.decisionContent!,
        aiResponse: response.content,
        modelUsed: `${response.provider}/${response.model}`,
        framework: route.framework,
        tokensInput: response.usage?.prompt_tokens,
        tokensOutput: response.usage?.completion_tokens,
      });

      // 抽 fact
      await extractFactsFromDecision({
        userId,
        decisionId,
        userQuestion: day.decisionContent!,
        aiResponse: response.content,
      });

      // 检查引用 (decision 输出里是否引用到了之前的 Pulse 关键词)
      const citationKeywords = ['老公', '我妈', '失眠', '凌晨', '兄弟姐妹', '新加坡', '同事', '上海', '总监', '8 岁'];
      const citationsFound = citationKeywords.filter((kw) => response.content.includes(kw));

      // brain consolidate after big event
      await maybeConsolidate(userId);

      return {
        day: day.day,
        action: 'decision',
        durationMs: Date.now() - startTime,
        output: response.content.slice(0, 1200) + '...',
        framework: route.framework,
        memoryStatsBefore: memBefore,
        memoryStatsAfter: getMemSnapshot(userId),
        expectations: day.expectations,
        citationsInOutput: citationsFound,
      };
    }

    throw new Error(`Unknown action: ${day.action}`);
  } catch (e: any) {
    return {
      day: day.day,
      action: day.action,
      durationMs: Date.now() - startTime,
      memoryStatsBefore: memBefore,
      memoryStatsAfter: getMemSnapshot(userId),
      expectations: day.expectations,
      error: e.message,
    };
  }
}

async function main() {
  const persona = JOURNEY_PERSONA;
  const journeyUid = `journey-${crypto.createHash('md5').update(persona.id).digest('hex').slice(0, 12)}`;
  const paddedUid = `${journeyUid.slice(0, 8)}-${journeyUid.slice(8, 12)}-0000-0000-000000000000`;
  const userId = findOrCreateUserByUid(paddedUid);

  // 清空 journey 用户历史 (保证可重跑) — 按 FK 反向顺序删除
  const db = getDb();
  // 1) 删 daily_pulses (FK: rmc_episodic_id → relationship_memory_cards)
  db.prepare('DELETE FROM daily_pulses WHERE user_id = ?').run(userId);
  // 2) 删 life_os_commitments (FK: source_decision_id → decisions)
  db.prepare('DELETE FROM life_os_commitments WHERE user_id = ?').run(userId);
  // 3) 删 inspector_audit (FK: decision_id → decisions)
  db.prepare('DELETE FROM inspector_audit WHERE user_id = ?').run(userId);
  // 4) 删 relationship_memory_cards (FK: source_decision_id → decisions)
  db.prepare('DELETE FROM relationship_memory_cards WHERE user_id = ?').run(userId);
  // 5) 现在可以删 decisions
  db.prepare('DELETE FROM decisions WHERE user_id = ?').run(userId);
  // 6) user-only 表
  db.prepare('DELETE FROM user_core_state WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM user_brain WHERE user_id = ?').run(userId);

  console.log(`\n🤖 Full Journey Simulator`);
  console.log(`Persona: ${persona.scenario}`);
  console.log(`Days: ${persona.days.length}\n`);

  const results: DayResult[] = [];
  for (const day of persona.days) {
    process.stdout.write(`  Day ${day.day.toString().padStart(2, ' ')} [${day.action.padEnd(10, ' ')}] `);
    const result = await runDay(persona, day, userId, paddedUid);
    results.push(result);

    if (result.error) {
      console.log(`❌ ${result.error}`);
    } else if (result.action === 'skip') {
      console.log(`⏭️  跳过`);
    } else if (result.action === 'onboarding') {
      console.log(`✅ ${result.output} | ${(result.durationMs / 1000).toFixed(1)}s`);
    } else if (result.action === 'pulse') {
      const tagsStr = (result.tags || []).join(',');
      console.log(`✅ tags:[${tagsStr}] | ${(result.durationMs / 1000).toFixed(1)}s`);
      console.log(`        AI: ${result.output?.slice(0, 100)}...`);
    } else if (result.action === 'decision') {
      const citations = result.citationsInOutput?.length || 0;
      console.log(`✅ framework:${result.framework} | citations:${citations} | ${(result.durationMs / 1000).toFixed(1)}s`);
      console.log(`        引用关键词: ${result.citationsInOutput?.join(', ') || '(无)'}`);
    }

    await new Promise((r) => setTimeout(r, 800));
  }

  // ========== Summary ==========
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 Full Journey Summary`);
  console.log('='.repeat(70));

  const finalMem = getMemSnapshot(userId);
  console.log(`\n14 天结束时:`);
  console.log(`  · core_state:    ${finalMem.coreState}`);
  console.log(`  · RMC cards:     ${finalMem.rmcTotal}`);
  console.log(`  · decisions:     ${finalMem.decisions}`);
  console.log(`  · pulses:        ${finalMem.pulses}`);
  console.log(`  · brain.md:      ${finalMem.hasBrain ? '✅ 有' : '🔴 没有'}`);

  // 决策引用质量
  const decisionResults = results.filter((r) => r.action === 'decision' && r.citationsInOutput);
  console.log(`\n决策引用 (跨 turn memory 真实证据):`);
  for (const r of decisionResults) {
    const citationCount = r.citationsInOutput?.length || 0;
    const status = citationCount >= 3 ? '✅' : citationCount >= 1 ? '🟡' : '🔴';
    console.log(`  ${status} Day ${r.day} (${r.framework}): ${citationCount} citations [${r.citationsInOutput?.join(', ')}]`);
  }

  // brain.md 更新
  const brainAfterDay7 = results.find((r) => r.day === 7)?.memoryStatsAfter.hasBrain;
  const brainAfterDay14 = results.find((r) => r.day === 14)?.memoryStatsAfter.hasBrain;
  console.log(`\nBrain.md 累积:`);
  console.log(`  Day 7 (后): ${brainAfterDay7 ? '✅ 有 brain' : '🔴 没 brain'}`);
  console.log(`  Day 14 (后): ${brainAfterDay14 ? '✅ 有 brain' : '🔴 没 brain'}`);

  // RMC 增长
  const growth = results.map((r) => r.memoryStatsAfter.rmcTotal);
  console.log(`\nRMC 累积曲线: ${growth.join(' → ')}`);

  // 总时长
  const totalMs = results.reduce((sum, r) => sum + r.durationMs, 0);
  console.log(`\n总耗时: ${(totalMs / 1000).toFixed(1)}s`);

  console.log(`\nDB: 用户 user_id=${userId} (UID ${paddedUid})`);
  console.log(`查 brain: sqlite3 data/life-os.db "SELECT content FROM user_brain WHERE user_id=${userId};"`);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
