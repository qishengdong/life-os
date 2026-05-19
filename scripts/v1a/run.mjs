/**
 * V1A · 14 天合成模拟 driver
 *
 * 流程:
 *   1. bootstrap: admin login + create invite + redeem · 创建 persona test user
 *   2. day loop 1..14:
 *      - 拿今天的 pulse question (KEY 5 类轮换)
 *      - persona LLM 写今日一句
 *      - submitPulse → 拿 KEY 回应
 *      - persona LLM 看回应 + 决定要不要续聊 (概率 30%)
 *      - 续聊则 replyToPulse
 *      - day 7: persona 写决定 → submitDecision → 拿 brief
 *      - 记录 full 对话 + state
 *   3. evaluator LLM-as-judge 看完 14 天:
 *      - memory_drift (KEY 是不是后期记得早期信号)
 *      - response_consistency
 *      - brief_grounding
 *      - persona_trust_score
 *      - top issues
 *   4. 输出 markdown report 到 docs/simulations/<date>/
 *
 * 跑法:
 *   1. ENV: DEEPSEEK_API_KEY · 本地 Next.js 在 :3001 跑着
 *   2. node --env-file=.env.local scripts/v1a/run.mjs
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  generateDailyPulse,
  decidePulseFollowup,
  generateDecisionInput,
} from './persona_driver.mjs';
import { KeyClient, bootstrapTestUser } from './key_api.mjs';
import { runEvaluator } from './evaluator.mjs';
import { PERSONA_PROFILES } from './persona_profiles.mjs';

const SIM_DAYS = parseInt(process.env.SIM_DAYS || '14', 10);
const DECISION_DAY = parseInt(process.env.DECISION_DAY || '7', 10);
const FOLLOWUP_PROB = 0.4; // 40% 概率 persona 续聊
// 默认跑 1 persona (V1A). 加 PERSONAS=F01,F02,M03,F07 跑 V1B
const PERSONAS_TO_RUN = (process.env.PERSONAS || 'F01').split(',').map((s) => s.trim()).filter(Boolean);

async function main() {
  console.log(`\n[V1] 启动 · 跑 ${PERSONAS_TO_RUN.length} persona: ${PERSONAS_TO_RUN.join(', ')}`);
  console.log(`[V1] 每 persona 模拟 ${SIM_DAYS} 天 · 第 ${DECISION_DAY} 天写决定\n`);
  for (const personaId of PERSONAS_TO_RUN) {
    const profile = PERSONA_PROFILES[personaId];
    if (!profile) {
      console.error(`[skip] ${personaId} 没在 PERSONA_PROFILES (有效: F01 / F02 / M03 / F07)`);
      continue;
    }
    try {
      await runOnePersona(profile);
    } catch (e) {
      console.error(`[FAIL] ${personaId}:`, e.message);
    }
  }
}

async function runOnePersona(profile) {
  const personaUid = crypto.randomUUID();
  const personaBirthDate = profile.birthDate;
  const personaGender = profile.gender;
  const personaSystem = profile.systemPrompt;
  const decisionTopic = profile.decisionTopic;
  const dayContexts = profile.dayContexts;

  console.log(`\n══════════════ ${profile.id} · ${profile.name} ══════════════`);
  console.log(`[run] UID = ${personaUid}`);

  console.log('[bootstrap] admin login + 创建 invite + 兑换 ...');
  const { inviteCode, recoveryCode } = await bootstrapTestUser(personaUid);
  console.log(`           ✓ invite ${inviteCode} · recovery ${recoveryCode}\n`);

  const client = new KeyClient({ userUid: personaUid });

  // ─── 14-day loop ────────────────────────────────────────────────────────
  /** @type {Array<{day:number, type:string, userContent:string, aiResponse?:string, pulseId?:number, decisionBrief?:string, reaction?:any}>} */
  const log = [];

  for (let day = 1; day <= SIM_DAYS; day++) {
    const dayContext = dayContexts[day - 1] || '';
    console.log(`\n──── Day ${day} ────  ${dayContext}`);

    // Day 7 写决策 (主要事件)
    if (day === DECISION_DAY) {
      console.log(`[Day ${DECISION_DAY}] persona 写决策中 ...`);
      const recentSignals = log.slice(-7).map((l, i) => ({
        day: l.day,
        userContent: l.userContent,
        aiResponse: l.aiResponse,
      }));
      const decisionText = await generateDecisionInput({ day, recentSignals, personaSystem, decisionTopic });
      console.log(`  user 写决策 (${decisionText.length} 字):`);
      console.log(`    ${decisionText.slice(0, 200)}${decisionText.length > 200 ? '...' : ''}`);

      const briefResp = await client.submitDecision({
        birthDate: personaBirthDate,
        gender: personaGender,
        decision: decisionText,
        skipEditor: true,
      });
      const briefNumber = briefResp.briefNumber || 'FAIL';
      const briefLen = briefResp.renderedMarkdown?.length || 0;
      console.log(`  KEY brief: ${briefNumber} (${briefLen} 字)`);

      log.push({
        day,
        type: 'decision',
        userContent: decisionText,
        aiResponse: briefResp.renderedMarkdown || '(no brief)',
        decisionBrief: briefNumber,
      });
      continue;
    }

    // 其他天 · 写今日一句
    const pulseSession = await client.getPulseSession();
    const todayQuestion = pulseSession.todayQuestion;
    if (!todayQuestion) {
      console.log('  · 拿不到 todayQuestion · skip');
      continue;
    }
    console.log(`  · 今日问题: ${todayQuestion.prompt.slice(0, 50)}...`);

    const recentSignals = log.slice(-5).map((l) => ({
      day: l.day, userContent: l.userContent, aiResponse: l.aiResponse,
    }));
    const userContent = await generateDailyPulse({
      day,
      dayContext,
      recentSignals,
      todayQuestion: todayQuestion.prompt,
      personaSystem,
    });
    console.log(`  user (${userContent.length} 字): ${userContent.slice(0, 100)}${userContent.length > 100 ? '...' : ''}`);

    const pulseResp = await client.submitPulse({
      questionId: todayQuestion.id,
      content: userContent,
    });
    if (!pulseResp.success) {
      console.log(`  ⚠ submitPulse fail: ${pulseResp.error}`);
      log.push({ day, type: 'pulse', userContent, aiResponse: '(fail: ' + pulseResp.error + ')' });
      continue;
    }
    const aiResponse = pulseResp.aiResponse;
    const pulseId = pulseResp.pulseId;
    console.log(`  KEY (${aiResponse.length} 字): ${aiResponse.slice(0, 100)}${aiResponse.length > 100 ? '...' : ''}`);

    const entry = { day, type: 'pulse', userContent, aiResponse, pulseId };

    // 决定要不要续聊
    if (Math.random() < FOLLOWUP_PROB && pulseId) {
      const reaction = await decidePulseFollowup({ day, userContent, keyResponse: aiResponse, recentSignals, personaSystem });
      console.log(`  · reaction: felt=${reaction.felt_received}/10 · want=${reaction.want_followup}`);
      entry.reaction = reaction;
      if (reaction.want_followup === 'yes' && reaction.followup_text) {
        console.log(`  user 续: ${reaction.followup_text.slice(0, 80)}...`);
        const replyResp = await client.replyToPulse({ pulseId, content: reaction.followup_text });
        if (replyResp.success) {
          console.log(`  KEY 续回: ${replyResp.aiTurn.content.slice(0, 80)}...`);
          entry.followupUser = reaction.followup_text;
          entry.followupAi = replyResp.aiTurn.content;
        }
      }
    }
    log.push(entry);
  }

  // ─── Evaluator ──────────────────────────────────────────────────────────
  console.log('\n──── 14 天跑完 · 开始 evaluator LLM-as-judge ────\n');
  const brain = await client.getBrain();
  const history = await client.getHistory();
  const evaluation = await runEvaluator({
    log,
    finalBrain: brain.memory || brain,
    finalHistory: history.briefs || history,
    personaInfo: {
      name: profile.name,
      age: new Date().getFullYear() - parseInt(profile.birthDate.slice(0, 4), 10),
      shortDesc: profile.systemPrompt.split('\n').find((l) => l.startsWith('姓名:'))?.replace('姓名: ', '') || '',
      hiddenTensions: profile.systemPrompt.includes('# 你没告诉')
        ? profile.systemPrompt.split('# 你没告诉')[1]?.split('\n').filter((l) => /^\d+\./.test(l.trim()))
        : [],
    },
  });

  // ─── 写报告 ────────────────────────────────────────────────────────────
  const outDir = path.join(
    process.cwd(),
    'docs',
    'simulations',
    `${profile.id}-${new Date().toISOString().slice(0, 10)}`,
  );
  fs.mkdirSync(outDir, { recursive: true });

  const reportPath = path.join(outDir, 'report.md');
  fs.writeFileSync(reportPath, buildReport({ profile, personaUid, log, evaluation, brain, history }), 'utf8');

  const rawPath = path.join(outDir, 'raw_log.json');
  fs.writeFileSync(rawPath, JSON.stringify({ profile, log, evaluation, brain, history }, null, 2), 'utf8');

  console.log(`\n✓ ${profile.id} ${profile.name} 跑完 ${SIM_DAYS} 天`);
  console.log(`  report: ${reportPath}`);
  console.log(`  raw:    ${rawPath}`);
}

function buildReport({ profile, personaUid, log, evaluation, brain, history }) {
  const lines = [];
  lines.push(`# V1 模拟报告 · ${profile.id} ${profile.name} · ${SIM_DAYS} 天`);
  lines.push('');
  lines.push(`**Persona UID**: \`${personaUid}\``);
  lines.push(`**模拟日期**: ${new Date().toISOString().slice(0, 10)}`);
  lines.push(`**总动作**: ${log.length} 条 (${log.filter((l) => l.type === 'pulse').length} 今日一句 + ${log.filter((l) => l.type === 'decision').length} 决策)`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Evaluator 评估');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(evaluation, null, 2));
  lines.push('```');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 14 天 timeline');
  lines.push('');
  for (const e of log) {
    lines.push(`### Day ${e.day} · ${e.type}`);
    lines.push('');
    lines.push(`**user**: ${e.userContent}`);
    lines.push('');
    if (e.aiResponse) {
      lines.push(`**KEY**: ${e.aiResponse.slice(0, 600)}${e.aiResponse.length > 600 ? '...' : ''}`);
      lines.push('');
    }
    if (e.followupUser) {
      lines.push(`**user 续**: ${e.followupUser}`);
      lines.push('');
      lines.push(`**KEY 续**: ${e.followupAi}`);
      lines.push('');
    }
    if (e.reaction) {
      lines.push(`**persona 反应**: felt_received=${e.reaction.felt_received}/10 · ${e.reaction.silent_thought || ''}`);
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }
  lines.push('## Final brain state');
  lines.push('');
  lines.push(`- 硬锚点: ${brain.memory?.coreState?.length || 0}`);
  lines.push(`- 事实: ${brain.memory?.factual?.length || 0}`);
  lines.push(`- 关系: ${brain.memory?.relational?.length || 0}`);
  lines.push(`- 重要事件: ${brain.memory?.episodic?.length || 0}`);
  lines.push(`- 边界: ${brain.memory?.boundary?.length || 0}`);
  lines.push(`- 心理信号: ${brain.memory?.psychSignal?.length || 0}`);
  lines.push(`- 未完的事: ${brain.memory?.openLoops?.length || 0}`);
  lines.push('');
  return lines.join('\n');
}

main().catch((e) => {
  console.error('V1A FATAL:', e);
  process.exit(1);
});
