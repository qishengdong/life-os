#!/usr/bin/env tsx
// @ts-nocheck
/**
 * Pulse Adversarial Runner
 *
 * 跑 8 个 Pulse 攻击 probe, 验证 AI 防御.
 *
 * 用法:
 *   npm run grade:pulse-adv
 *   npm run grade:pulse-adv -- --probe 0,2,5
 */

if (!process.env.DEEPSEEK_API_KEY) {
  console.error('❌ DEEPSEEK_API_KEY not set');
  process.exit(1);
}

import { PULSE_PROBES, type PulseProbe } from '@/lib/grader/pulse-probes';
import { processPulse } from '@/lib/pulse/tagger';
import { addPulse } from '@/lib/pulse/store';
import { findOrCreateUserByUid, getDb } from '@/lib/db';
import crypto from 'crypto';

interface ProbeResult {
  probe: PulseProbe;
  aiResponse: string;
  tags: string[];
  durationMs: number;
  defenseOk: boolean;
  forbiddenHits: string[];
  expectedHits: string[];
  tagMatchOk: boolean;
}

async function runProbe(probe: PulseProbe): Promise<ProbeResult> {
  const startTime = Date.now();

  // 隔离 UID (跟 normal swarm 分开)
  const probeUid = `pulseadv-${crypto.createHash('md5').update(probe.id).digest('hex').slice(0, 8)}-0000-0000-000000000000`;
  const userId = await findOrCreateUserByUid(probeUid);

  // 清这个 probe user 的历史 (保证可重跑且无记忆)
  const db = await getDb();
  db.prepare('DELETE FROM daily_pulses WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM relationship_memory_cards WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM user_core_state WHERE user_id = ?').run(userId);

  // 跑 Pulse
  const result = await processPulse({
    userId,
    questionId: probe.questionId as any,
    content: probe.content,
  });

  // 持久化 (做完整测试)
  await addPulse({
    userId,
    questionId: probe.questionId,
    content: probe.content,
    tags: result.tags as any,
    aiResponse: result.aiResponse,
    rmcEpisodicId: result.rmcEpisodicId,
  });

  // 检查防御:
  // 1) forbidden 短语都没出现
  const forbiddenHits = probe.forbiddenInResponse.filter((f) =>
    result.aiResponse.includes(f)
  );
  // 2) expected 短语至少出现 1 个 (如果有 expected)
  const expectedHits = probe.expectedInResponse
    ? probe.expectedInResponse.filter((e) => result.aiResponse.includes(e))
    : [];
  const expectedOk = !probe.expectedInResponse || expectedHits.length > 0;
  // 3) tags 期望命中 (如果有)
  const tagMatchOk = !probe.expectedTags ||
    probe.expectedTags.every((t) => (result.tags as string[]).includes(t));

  const defenseOk = forbiddenHits.length === 0 && expectedOk;

  return {
    probe,
    aiResponse: result.aiResponse,
    tags: result.tags,
    durationMs: Date.now() - startTime,
    defenseOk,
    forbiddenHits,
    expectedHits,
    tagMatchOk,
  };
}

async function main() {
  const args = process.argv.slice(2);
  let probesToRun: PulseProbe[] = PULSE_PROBES;
  let label = `pulse-adv-${new Date().toISOString().slice(0, 16)}`;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--probe' && args[i + 1]) {
      const indices = args[++i].split(',').map((x) => parseInt(x.trim()));
      probesToRun = indices.map((idx) => PULSE_PROBES[idx]).filter(Boolean);
    } else if (args[i] === '--label' && args[i + 1]) {
      label = args[++i];
    }
  }

  console.log(`\n🛡️  Pulse Adversarial Probes — ${label}`);
  console.log(`Probes: ${probesToRun.length}\n`);

  const results: ProbeResult[] = [];
  for (let i = 0; i < probesToRun.length; i++) {
    const probe = probesToRun[i];
    process.stdout.write(`  [${i + 1}/${probesToRun.length}] ${probe.attackType.padEnd(20)} `);
    try {
      const result = await runProbe(probe);
      results.push(result);
      const icon = result.defenseOk ? '✅' : '🔴';
      console.log(`${icon} ${(result.durationMs / 1000).toFixed(1)}s`);
      if (!result.defenseOk) {
        if (result.forbiddenHits.length > 0) {
          console.log(`      🔴 出现禁词: ${result.forbiddenHits.join(', ')}`);
        }
        if (probe.expectedInResponse && result.expectedHits.length === 0) {
          console.log(`      🔴 期望词缺失: ${probe.expectedInResponse.join(' / ')}`);
        }
      }
      // 防 rate limit
      await new Promise((r) => setTimeout(r, 800));
    } catch (e: any) {
      console.log(`❌ ${e.message}`);
    }
  }

  // ========== Summary ==========
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 Pulse Defense Summary | ${label}`);
  console.log('='.repeat(70));

  const passed = results.filter((r) => r.defenseOk).length;
  const total = results.length;
  console.log(`\n防御率: ${passed}/${total} = ${((passed / total) * 100).toFixed(0)}%\n`);

  for (const r of results) {
    const icon = r.defenseOk ? '✅' : '🔴';
    console.log(`${icon} ${r.probe.attackType}`);
    console.log(`   严重度: ${r.probe.expectedSeverity}`);
    console.log(`   Tags: ${r.tags.join(', ') || '(none)'}`);
    console.log(`   AI 回应: ${r.aiResponse}`);
    if (!r.defenseOk) {
      console.log(`   🔴 防御失败原因:`);
      if (r.forbiddenHits.length > 0) console.log(`      出现禁词: ${r.forbiddenHits.join(', ')}`);
      if (r.probe.expectedInResponse && r.expectedHits.length === 0) {
        console.log(`      缺失期望词: ${r.probe.expectedInResponse.join(' / ')}`);
      }
    }
    if (r.probe.expectedTags && !r.tagMatchOk) {
      console.log(`   ⚠️  期望 tags ${r.probe.expectedTags.join(',')}, 实际 ${r.tags.join(',')}`);
    }
    console.log();
  }

  // P0 失败必须 flag
  const p0Failed = results.filter((r) => r.probe.expectedSeverity === 'p0' && !r.defenseOk);
  if (p0Failed.length > 0) {
    console.log(`🚨 P0 严重度防御失败 ${p0Failed.length} 个:`);
    for (const r of p0Failed) {
      console.log(`   · ${r.probe.attackType} (${r.probe.id})`);
    }
    console.log(`\n这些必须在 ship 前修复.\n`);
  }
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
