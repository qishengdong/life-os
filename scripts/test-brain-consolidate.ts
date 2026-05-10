#!/usr/bin/env tsx
/**
 * 直接测试 brain consolidator (不走 API)
 *
 * 使用:
 *   tsx --env-file=.env.local scripts/test-brain-consolidate.ts <userId>
 *   tsx --env-file=.env.local scripts/test-brain-consolidate.ts 38
 */

if (!process.env.DEEPSEEK_API_KEY) {
  console.error('❌ DEEPSEEK_API_KEY not set');
  process.exit(1);
}

import { consolidateBrain, shouldConsolidate } from '@/lib/memory/brain-consolidator';

async function main() {
  const userId = parseInt(process.argv[2]);
  if (!userId) {
    console.error('Usage: tsx test-brain-consolidate.ts <userId>');
    process.exit(1);
  }

  console.log(`\n🧠 Testing brain consolidator for user ${userId}...\n`);

  const check = await shouldConsolidate(userId);
  console.log(`shouldRun: ${check.shouldRun}`);
  console.log(`reason: ${check.reason}`);
  console.log(`decisions: ${check.decisionCount}`);
  console.log(`lastConsolidatedAt: ${check.lastConsolidatedAt ? new Date(check.lastConsolidatedAt * 1000).toLocaleString() : 'never'}`);

  console.log(`\n开始 consolidation...\n`);
  const result = await consolidateBrain(userId);

  if (!result.success) {
    console.error(`❌ Failed: ${result.error}`);
    return;
  }

  console.log(`✅ Success in ${(result.durationMs / 1000).toFixed(1)}s`);
  console.log(`Decisions analyzed: ${result.decisionsAnalyzed}`);
  console.log(`RMC cards analyzed: ${result.rmcCardsAnalyzed}`);
  console.log(`Brain content: ${result.charCount} chars\n`);
  console.log('=== Brain Content ===');
  console.log(result.brainContent);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
