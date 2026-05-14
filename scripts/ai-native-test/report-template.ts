/**
 * AI Native Test V2 · 报告生成器
 *
 * 输入: 所有 personas + 所有 letter 结果 + grade
 * 输出: markdown 报告字符串
 *
 * 报告结构:
 *   1. 总览 (聚合统计)
 *   2. 6 维度结果 (各维度通过率 + 典型失败案例)
 *   3. 记忆测试 (referencesEarlier 命中率)
 *   4. 代表性回复 (best + worst per framework)
 *   5. Persona 画像维度命中 (按 persona 看哪些 theme/framework 表现差)
 *   6. 失败模式总结 + voice spec 改进建议
 */

interface LetterResult {
  scenario: any;
  userLetter: string;
  keyReply: string | null;
  replyDurationMs?: number;
  framework?: string;
  psychThemes?: string[];
  grade: any;
  error?: string;
}

interface PersonaResult {
  personaId: string;
  personaDisplayName: string;
  letters: LetterResult[];
}

export function generateReport(allResults: PersonaResult[], totalElapsedMs: number): string {
  const lines: string[] = [];

  const allLetters = allResults.flatMap((p) =>
    p.letters.map((l) => ({ ...l, personaId: p.personaId, personaName: p.personaDisplayName })),
  );
  const graded = allLetters.filter((l) => l.grade);
  const errored = allLetters.filter((l) => l.error);

  const passed = graded.filter((l) => l.grade.pass);
  const failed = graded.filter((l) => !l.grade.pass);

  // =============================================================
  // 1. 总览
  // =============================================================
  lines.push('# KEY · AI Native Test V2 报告');
  lines.push('');
  lines.push(`**测试时间**: ${new Date().toISOString()}`);
  lines.push(`**总耗时**: ${(totalElapsedMs / 1000 / 60).toFixed(1)} 分钟`);
  lines.push(`**Personas**: ${allResults.length} 个`);
  lines.push(`**信件总数**: ${allLetters.length}`);
  lines.push(`**生成成功**: ${graded.length} / ${allLetters.length}`);
  lines.push(`**Grade 通过**: ${passed.length} / ${graded.length} (${graded.length > 0 ? Math.round((passed.length / graded.length) * 100) : 0}%)`);
  lines.push(`**Pipeline 失败**: ${errored.length}`);
  lines.push('');

  // 平均维度
  if (graded.length > 0) {
    const avg = (key: string) =>
      graded.reduce((sum, l) => sum + l.grade.dimensions[key].score, 0) / graded.length;
    lines.push('## 6 维平均分');
    lines.push('');
    lines.push('| 维度 | 平均 | 通过率 |');
    lines.push('|---|---|---|');
    for (const dim of ['voice', 'canon', 'memory', 'question', 'psychHidden', 'form']) {
      const score = avg(dim);
      const passRate =
        graded.filter((l) => l.grade.dimensions[dim].pass).length / graded.length;
      lines.push(`| ${dim} | ${score.toFixed(2)} | ${Math.round(passRate * 100)}% |`);
    }
    lines.push('');
  }

  // =============================================================
  // 2. 各维度失败案例
  // =============================================================
  lines.push('## 各维度失败案例 (3 个 sample)');
  lines.push('');
  for (const dim of ['voice', 'canon', 'memory', 'question', 'psychHidden', 'form']) {
    const failsInDim = graded
      .filter((l) => !l.grade.dimensions[dim].pass)
      .slice(0, 3);
    if (failsInDim.length === 0) {
      lines.push(`### ${dim} ✓ 全通过`);
      lines.push('');
      continue;
    }
    lines.push(`### ${dim} — ${failsInDim.length} 失败 sample`);
    lines.push('');
    for (const l of failsInDim) {
      lines.push(`- **${l.personaId}#${l.scenario.order}** (${l.personaName}): ${l.grade.dimensions[dim].note}`);
    }
    lines.push('');
  }

  // =============================================================
  // 3. 记忆测试
  // =============================================================
  lines.push('## 记忆测试 (referencesEarlier)');
  lines.push('');
  const memoryTests = allLetters.filter(
    (l) => l.scenario.referencesEarlier && l.scenario.referencesEarlier.length > 0 && l.grade,
  );
  if (memoryTests.length === 0) {
    lines.push('_(本次测试无 memory anchor 场景)_');
  } else {
    const memPassed = memoryTests.filter((l) => l.grade.dimensions.memory.pass);
    lines.push(`总: ${memoryTests.length} 个带 memory anchor 场景`);
    lines.push(`通过: ${memPassed.length} (${Math.round((memPassed.length / memoryTests.length) * 100)}%)`);
    lines.push('');
    lines.push('| Persona | Letter | Anchor | 命中 | 备注 |');
    lines.push('|---|---|---|---|---|');
    for (const l of memoryTests) {
      const anchor = l.scenario.memoryAnchor || '—';
      const status = l.grade.dimensions.memory.pass ? '✓' : '⚠';
      lines.push(
        `| ${l.personaId} (${l.personaName}) | #${l.scenario.order} | \`${anchor}\` | ${status} | ${l.grade.dimensions.memory.note} |`,
      );
    }
    lines.push('');
  }

  // =============================================================
  // 4. 代表性回复 (best + worst)
  // =============================================================
  lines.push('## 代表性 KEY 回复');
  lines.push('');

  if (graded.length > 0) {
    // best 1 个
    const best = [...graded].sort((a, b) => b.grade.overallScore - a.grade.overallScore)[0];
    lines.push(`### ✨ Best · ${best.personaId} (${best.personaName}) Letter #${best.scenario.order} · score ${best.grade.overallScore.toFixed(2)}`);
    lines.push('');
    lines.push(`**用户来信** (context: ${best.scenario.context}):`);
    lines.push('');
    lines.push('> ' + best.userLetter.replace(/\n/g, '\n> '));
    lines.push('');
    lines.push('**KEY 回信**:');
    lines.push('');
    lines.push(best.keyReply || '_(空)_');
    lines.push('');
    lines.push(`**为何 best**: voice ${best.grade.dimensions.voice.score.toFixed(2)}, canon ${best.grade.dimensions.canon.score.toFixed(2)}, memory ${best.grade.dimensions.memory.score.toFixed(2)}, psychHidden ${best.grade.dimensions.psychHidden.score.toFixed(2)}`);
    lines.push('');

    // worst 1 个
    const worst = [...graded].sort((a, b) => a.grade.overallScore - b.grade.overallScore)[0];
    if (worst.scenario.order !== best.scenario.order || worst.personaId !== best.personaId) {
      lines.push(`### ⚠ Worst · ${worst.personaId} (${worst.personaName}) Letter #${worst.scenario.order} · score ${worst.grade.overallScore.toFixed(2)}`);
      lines.push('');
      lines.push(`**用户来信** (context: ${worst.scenario.context}):`);
      lines.push('');
      lines.push('> ' + worst.userLetter.replace(/\n/g, '\n> '));
      lines.push('');
      lines.push('**KEY 回信**:');
      lines.push('');
      lines.push(worst.keyReply || '_(空)_');
      lines.push('');
      lines.push(`**问题**:`);
      for (const [dim, d] of Object.entries(worst.grade.dimensions)) {
        const dd = d as { score: number; pass: boolean; note: string };
        if (!dd.pass) lines.push(`- ${dim}: ${dd.note}`);
      }
      lines.push('');
    }
  }

  // 每 framework 1 个代表 (best in framework)
  const frameworks = ['family-of-origin', 'marriage', 'child-education', 'parent-care', 'work-meaning', 'self'];
  lines.push('### 各 framework best 回复');
  lines.push('');
  for (const fw of frameworks) {
    const inFw = graded.filter((l) => l.framework === fw);
    if (inFw.length === 0) continue;
    const top = inFw.sort((a, b) => b.grade.overallScore - a.grade.overallScore)[0];
    lines.push(`#### ${fw} · ${top.personaId} #${top.scenario.order} · score ${top.grade.overallScore.toFixed(2)}`);
    lines.push('');
    lines.push(`> 用户: "${top.userLetter.slice(0, 100)}..."`);
    lines.push('');
    lines.push(`> KEY: "${top.keyReply?.slice(0, 200)}..."`);
    lines.push('');
  }

  // =============================================================
  // 5. Persona 维度
  // =============================================================
  lines.push('## 每个 Persona 表现');
  lines.push('');
  lines.push('| Persona | 信件数 | 平均分 | 通过 | 表现弱点 |');
  lines.push('|---|---|---|---|---|');
  for (const personaResult of allResults) {
    const lettersGraded = personaResult.letters.filter((l) => l.grade);
    if (lettersGraded.length === 0) {
      lines.push(`| ${personaResult.personaId} (${personaResult.personaDisplayName}) | 0 | — | — | pipeline 全部失败 |`);
      continue;
    }
    const avgScore =
      lettersGraded.reduce((sum, l) => sum + l.grade.overallScore, 0) / lettersGraded.length;
    const passCount = lettersGraded.filter((l) => l.grade.pass).length;
    // 找最弱维度
    const dimScores: Record<string, number> = {};
    for (const dim of ['voice', 'canon', 'memory', 'question', 'psychHidden', 'form']) {
      dimScores[dim] =
        lettersGraded.reduce((sum, l) => sum + l.grade.dimensions[dim].score, 0) /
        lettersGraded.length;
    }
    const weakest = Object.entries(dimScores).sort(([, a], [, b]) => a - b)[0];
    lines.push(
      `| ${personaResult.personaId} (${personaResult.personaDisplayName}) | ${lettersGraded.length} | ${avgScore.toFixed(2)} | ${passCount}/${lettersGraded.length} | ${weakest[0]} ${weakest[1].toFixed(2)} |`,
    );
  }
  lines.push('');

  // =============================================================
  // 6. 失败模式 + 建议
  // =============================================================
  lines.push('## 失败模式与改进建议');
  lines.push('');
  const findings: string[] = [];

  // canon pass < 80%
  if (graded.length > 0) {
    const canonPass = graded.filter((l) => l.grade.dimensions.canon.pass).length / graded.length;
    if (canonPass < 0.8) {
      findings.push(
        `📕 Canon 引文通过率 ${Math.round(canonPass * 100)}% — voice spec 可能没强调够"必须引用"`,
      );
    }

    const memPass = graded.filter((l) => l.grade.dimensions.memory.pass).length / graded.length;
    if (memPass < 0.7) {
      findings.push(
        `🧠 Memory 回响通过率 ${Math.round(memPass * 100)}% — brain seed 注入不充分, 或 voice spec 没强迫引用过往`,
      );
    }

    const psychPass = graded.filter((l) => l.grade.dimensions.psychHidden.pass).length / graded.length;
    if (psychPass < 0.7) {
      findings.push(
        `🎭 心理学藏在笔触里 ${Math.round(psychPass * 100)}% — 需更精细 voice spec, 或 banned 术语列表加宽`,
      );
    }

    const qPass = graded.filter((l) => l.grade.dimensions.question.pass).length / graded.length;
    if (qPass < 0.8) {
      findings.push(
        `❓ 提问通过率 ${Math.round(qPass * 100)}% — 提问堆叠或缺失, voice spec "1 个提问" 强调不够`,
      );
    }
  }

  if (findings.length === 0) {
    findings.push('✅ 没有显著失败模式 — 各维度通过率均 > 80%');
  }

  for (const f of findings) lines.push(`- ${f}`);
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('## 原始数据');
  lines.push('');
  lines.push('每封信的完整数据 (用户来信 + KEY 回信 + grade 详情) 在 `./raw/persona-X/letter-N.md`');
  lines.push('');

  return lines.join('\n');
}
