/**
 * AI Native Test V2 · 主运行器
 *
 * 流程:
 *   1. 用 test DB (不污染 dev/prod 数据)
 *   2. 每个 persona: 创建 synthetic user → seed brain → 写 5 封信
 *   3. 每封信: generateReply (真 LLM) → save to letters table → grade
 *   4. 收集所有 grades → 生成 markdown 报告 + raw 信件文件
 *
 * 用法:
 *   npm run ai-native-test
 *   AI_TEST_PERSONAS=A,C,D npm run ai-native-test  (只跑指定 persona)
 *
 * 输出:
 *   docs/ai-native-test/YYYY-MM-DD/
 *     report.md                 # 总报告
 *     raw/persona-X/letter-N.md # 每封信完整数据
 */

// 必须在 import 任何 lib 之前 set 测试 DB 路径 — 见 main() 里的 dynamic import 解释
import path from 'path';
import fs from 'fs';
import os from 'os';

const TEST_DB_PATH = process.env.AI_TEST_DB_PATH
  || path.join(os.tmpdir(), `ai-native-test-${Date.now()}.db`);

// 强制让 lib/db 用 test 路径
process.env.DATABASE_PATH = TEST_DB_PATH;

// 重要: 上面这行必须在所有 lib import 之前. TS 看似导入顺序会做 hoisting,
// 但 require() 是 runtime, 我们这里用 dynamic import 保证顺序.
async function main() {
  console.log(`[setup] test DB = ${TEST_DB_PATH}`);

  // 动态 import 让 DATABASE_PATH 生效
  const { getDb, findOrCreateUserByUid } = await import('@/lib/db');
  const { addCoreState } = await import('@/lib/memory');
  const { generateReply } = await import('@/lib/letters/pipeline');
  const { createLetter, updateLetterReply, markLetterFailed } = await import('@/lib/letters/store');
  const { gradeLetterReply } = await import('./grader');
  const { PERSONAS } = await import('./personas');
  const { SCENARIOS } = await import('./scenarios');
  const { generateReport } = await import('./report-template');

  // 触发 DB init
  getDb();
  console.log('[setup] DB initialized');

  // 过滤 personas (通过 env var)
  const filterIds = process.env.AI_TEST_PERSONAS?.split(',');
  const personasToRun = filterIds
    ? PERSONAS.filter((p) => filterIds.includes(p.id))
    : PERSONAS.filter((p) => SCENARIOS.some((s) => s.personaId === p.id));

  console.log(`[setup] 将跑 ${personasToRun.length} personas\n`);

  const allResults: Array<{
    personaId: string;
    personaDisplayName: string;
    letters: Array<{
      scenario: any;
      userLetter: string;
      keyReply: string | null;
      replyDurationMs?: number;
      framework?: string;
      psychThemes?: string[];
      grade: any;
      error?: string;
    }>;
  }> = [];

  const t0 = Date.now();

  for (const persona of personasToRun) {
    console.log(`\n========================================`);
    console.log(`Persona ${persona.id} · ${persona.displayName} · ${persona.gender} ${persona.age}`);
    console.log(`========================================`);

    // 1. 创建 synthetic user
    const uid = `00000000-0000-4000-8000-${persona.id.padStart(12, '0').toLowerCase()}${'0'.repeat(11)}`;
    const slicedUid = uid.slice(0, 36);
    const userId = findOrCreateUserByUid(slicedUid);
    console.log(`✓ user_id = ${userId} (uid suffix=${persona.id})`);

    // 2. Seed brain (用 addCoreState 注入 brain seed)
    for (const seed of persona.brainSeed) {
      addCoreState({
        userId,
        kind: seed.topic,
        factText: seed.fact,
        severity: 'soft',
        source: 'admin',
      });
    }
    console.log(`✓ seeded ${persona.brainSeed.length} brain facts`);

    // 3. 找这个 persona 的 scenarios
    const scenarios = SCENARIOS.find((s) => s.personaId === persona.id);
    if (!scenarios) {
      console.log(`✗ no scenarios for ${persona.id}, 跳过`);
      continue;
    }

    const personaResults: typeof allResults[0]['letters'] = [];

    // 4. 按 order 写信
    for (const scenario of scenarios.letters) {
      console.log(`\n→ Letter ${scenario.order} (day ${scenario.virtualDay}): ${scenario.context}`);
      const letterStart = Date.now();

      // 创建 letter row (pending)
      const letter = createLetter({ userId, userContent: scenario.content });

      // 跑 pipeline
      let reply: string | null = null;
      let framework: string | undefined;
      let psychThemes: string[] | undefined;
      let durationMs = 0;
      let error: string | undefined;
      try {
        const result = await generateReply({
          userId,
          userContent: scenario.content,
          letterNumber: letter.letterNumber,
          displayName: persona.displayName,
        });
        durationMs = result.durationMs || 0;
        framework = result.framework;
        psychThemes = result.psychologicalThemes;
        if (result.success && result.reply) {
          reply = result.reply;
          updateLetterReply({
            letterId: letter.id,
            replyContent: result.reply,
            tokensUsed: result.tokensUsed,
            modelUsed: result.modelUsed,
            durationMs: result.durationMs,
            canonQuotesUsed: result.canonQuotesUsed,
            brainFactsUsed: result.brainFactsUsed,
            frameworkMatched: result.framework,
          });
        } else {
          error = result.error;
          markLetterFailed({ letterId: letter.id, reason: result.error || 'unknown' });
        }
      } catch (e: any) {
        error = e?.message || 'pipeline exception';
        console.log(`  ✗ pipeline 异常: ${error}`);
      }

      const letterElapsed = Date.now() - letterStart;
      console.log(`  ⏱ ${(letterElapsed / 1000).toFixed(1)}s · framework=${framework || '—'} · themes=[${psychThemes?.join(',') || '—'}]`);

      // 5. Grade
      let grade: any = null;
      if (reply) {
        try {
          grade = await gradeLetterReply({
            letterId: `${persona.id}-${scenario.order}`,
            userLetter: scenario.content,
            keyReply: reply,
            expectedThemes: scenario.expectedThemes,
            memoryAnchor: scenario.memoryAnchor,
            isFirstLetter: scenario.order === 1,
          });
          const status = grade.pass ? '✓' : '⚠';
          console.log(`  ${status} grade ${grade.overallScore.toFixed(2)} | v=${grade.dimensions.voice.score.toFixed(1)} c=${grade.dimensions.canon.score.toFixed(1)} m=${grade.dimensions.memory.score.toFixed(1)} q=${grade.dimensions.question.score.toFixed(1)} ψ=${grade.dimensions.psychHidden.score.toFixed(1)} f=${grade.dimensions.form.score.toFixed(1)}`);
        } catch (e: any) {
          console.log(`  ✗ grader 异常: ${e?.message}`);
        }
      }

      personaResults.push({
        scenario,
        userLetter: scenario.content,
        keyReply: reply,
        replyDurationMs: durationMs,
        framework,
        psychThemes,
        grade,
        error,
      });
    }

    allResults.push({
      personaId: persona.id,
      personaDisplayName: persona.displayName,
      letters: personaResults,
    });
  }

  const totalElapsed = Date.now() - t0;
  console.log(`\n\n========================================`);
  console.log(`✓ 全部跑完, 总耗时 ${(totalElapsed / 1000 / 60).toFixed(1)} 分钟`);
  console.log(`========================================`);

  // 生成 报告
  const reportDir = path.join(
    process.cwd(),
    'docs',
    'ai-native-test',
    new Date().toISOString().slice(0, 10),
  );
  fs.mkdirSync(reportDir, { recursive: true });
  fs.mkdirSync(path.join(reportDir, 'raw'), { recursive: true });

  const report = generateReport(allResults, totalElapsed);
  fs.writeFileSync(path.join(reportDir, 'report.md'), report, 'utf8');
  console.log(`✓ 报告: ${path.join(reportDir, 'report.md')}`);

  // 写 raw 原始信件 (每 persona 一个目录)
  for (const personaResult of allResults) {
    const personaDir = path.join(reportDir, 'raw', `persona-${personaResult.personaId}`);
    fs.mkdirSync(personaDir, { recursive: true });
    for (const letter of personaResult.letters) {
      const fileName = `letter-${letter.scenario.order}.md`;
      const content = formatLetterRaw(personaResult, letter);
      fs.writeFileSync(path.join(personaDir, fileName), content, 'utf8');
    }
  }
  console.log(`✓ raw 信件: ${path.join(reportDir, 'raw')}`);

  // 清 test DB
  try {
    fs.unlinkSync(TEST_DB_PATH);
    console.log(`✓ cleaned test DB`);
  } catch {}
}

function formatLetterRaw(
  persona: { personaId: string; personaDisplayName: string },
  letter: {
    scenario: any;
    userLetter: string;
    keyReply: string | null;
    framework?: string;
    psychThemes?: string[];
    grade: any;
    error?: string;
  },
): string {
  const lines: string[] = [];
  lines.push(`# Persona ${persona.personaId} (${persona.personaDisplayName}) · Letter ${letter.scenario.order}`);
  lines.push('');
  lines.push(`**Day**: virtual day ${letter.scenario.virtualDay}`);
  lines.push(`**Context**: ${letter.scenario.context}`);
  lines.push(`**Expected framework**: ${letter.scenario.expectedFramework}`);
  lines.push(`**Expected themes**: ${letter.scenario.expectedThemes.join(', ')}`);
  if (letter.scenario.memoryAnchor) {
    lines.push(`**Memory anchor**: ${letter.scenario.memoryAnchor}`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 用户来信');
  lines.push('');
  lines.push(letter.userLetter);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## KEY 回信');
  lines.push('');
  if (letter.error) {
    lines.push(`**ERROR**: ${letter.error}`);
  } else if (letter.keyReply) {
    lines.push(letter.keyReply);
  } else {
    lines.push('_(无回信)_');
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Metadata');
  lines.push('');
  lines.push(`- Detected framework: \`${letter.framework || '—'}\``);
  lines.push(`- Detected psych themes: ${letter.psychThemes?.map((t) => `\`${t}\``).join(', ') || '—'}`);
  if (letter.grade) {
    lines.push(`- **Overall score**: ${letter.grade.overallScore.toFixed(2)} (${letter.grade.pass ? '✓ pass' : '⚠ fail'})`);
    lines.push('');
    lines.push('### Grade 详情');
    for (const [dim, d] of Object.entries(letter.grade.dimensions)) {
      const dd = d as { score: number; pass: boolean; note: string };
      lines.push(`- **${dim}**: ${dd.score.toFixed(2)} ${dd.pass ? '✓' : '⚠'} — ${dd.note}`);
    }
  }
  lines.push('');
  return lines.join('\n');
}

// =============================================================
// 执行
// =============================================================
main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
