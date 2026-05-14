/**
 * AI Native Test V2 · LLM-based Grader
 *
 * 评每封 KEY 回信, 6 维:
 *   1. voice — banned phrases, diagnostic terms, markdown/emoji
 *   2. canon — 引文存在 + 有出处
 *   3. memory — 引用 brain seed / 早封信内容 (1st 封跳过)
 *   4. question — 有且只有 1 个克制提问
 *   5. psych-hidden — 心理学专业藏在编辑笔触里 (LLM judge)
 *   6. form — 称呼 + 段落 + 落款 pattern
 *
 * 评分: 0-1 (1 = 完美), 给 note 说明
 */

import { modelRouter } from '@/lib/model-router';

export interface GradeDimension {
  score: number;        // 0-1
  pass: boolean;        // score >= 0.6
  note: string;         // 1 句说明
}

export interface LetterGrade {
  letterId: string;     // persona-A-letter-1
  overallScore: number; // average of 6 dims
  pass: boolean;        // all 6 pass
  dimensions: {
    voice: GradeDimension;
    canon: GradeDimension;
    memory: GradeDimension;
    question: GradeDimension;
    psychHidden: GradeDimension;
    form: GradeDimension;
  };
}

// ============================================================
// Rule-based grader (确定性, 不用 LLM)
// ============================================================

const BANNED_PHRASES = [
  '我理解你的感受', '我能理解你', '我懂你', '你不孤单', '你并不孤单',
  '很多人都', '加油', '挺住', '你能行', '会好起来的',
  '不要灰心', '不要难过', '不要担心',
  '我可以帮你', '我可以协助', '希望我能', '如果你需要',
  '首先,', '首先，', '其次,', '其次，', '最后,', '最后，',
  '希望你', '祝你', '愿你',
  '作为 AI', '作为人工智能', '我是 AI', '我没有真实感受',
  '童年创伤', '原生家庭创伤', '焦虑型依恋', '回避型依恋',
  '投射', '防御机制', '内在小孩',
];

const DIAGNOSIS_TERMS = [
  '焦虑型依恋', '回避型依恋', '紊乱型依恋',
  '原生家庭创伤', '童年创伤',
  '投射', '防御机制', '内在小孩', '内在父母',
  '自我分化不足', '三角关系',
  '焦虑症', '抑郁症', 'PTSD', '强迫症',
];

export function gradeVoice(reply: string): GradeDimension {
  const banned = BANNED_PHRASES.filter((p) => reply.includes(p));
  const diagnosis = DIAGNOSIS_TERMS.filter((t) => reply.includes(t));
  const hasEmoji = /[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{26FF}]/u.test(reply);
  const hasMarkdown = /\*\*|^#|^- /m.test(reply);
  const exclaimCount = (reply.match(/[!！]/g) || []).length;

  const issues: string[] = [];
  if (banned.length > 0) issues.push(`banned: ${banned.join(', ')}`);
  if (diagnosis.length > 0) issues.push(`诊断术语: ${diagnosis.join(', ')}`);
  if (hasEmoji) issues.push('含 emoji');
  if (hasMarkdown) issues.push('含 markdown');
  if (exclaimCount > 1) issues.push(`${exclaimCount} 个感叹号`);

  const penalty = banned.length * 0.3 + diagnosis.length * 0.3 + (hasEmoji ? 0.2 : 0) + (hasMarkdown ? 0.2 : 0) + Math.max(0, (exclaimCount - 1) * 0.1);
  const score = Math.max(0, 1 - penalty);

  return {
    score,
    pass: score >= 0.6,
    note: issues.length ? issues.join('; ') : 'voice clean',
  };
}

export function gradeCanon(reply: string): GradeDimension {
  // 方案 1: 检查是否包含 canon-seed 里的真引文 substring (最准确)
  // 动态 import 避免循环依赖, 这里硬拷一些代表性 quote 关键词
  const KNOWN_CANON_KEYWORDS = [
    '弗洛姆', '荣格', 'Bowen', 'Bowlby', 'Yalom', 'Brown', 'Brene Brown', 'Perel',
    '武志红', '许燕', 'Susan David', 'Henry Cloud', 'Scott Peck', 'Levine',
    'van der Kolk', 'Hollis', 'Frankl', 'Gottlieb', 'Rogers', '梭罗', '木心',
    '泰戈尔', '纳兰性德', '王阳明', '老子', '苏格拉底', '蒙田', '赫拉克利特',
    '托尔斯泰', '太宰治', '里尔克', '海德格尔', '帕斯卡', '河合隼雄',
    '塔木德', '但丁', '蒙台梭利', '尹建莉', '黄永玉', '叶芝', '纪伯伦',
    'Maya Angelou', '《家庭', '《为何', '《目送', '《先知', '《道德经', '《思想录',
    '《存在', '《飞鸟', '《饮水', '《传习', '《人间', '《瓦尔登', '《我们仨', '《心经',
    'Emotional Agility', 'Daring Greatly', 'Body Keeps', 'Mating in Captivity',
  ];
  const hasKnownAuthor = KNOWN_CANON_KEYWORDS.some((kw) => reply.includes(kw));

  // 方案 2: 检查 attribution 模式 (—— XX,《YY》 / —— XX, YY)
  const hasAttribution =
    /[——]{2,}\s*[一-龥A-Za-z]/.test(reply) || /—\s*[一-龥A-Za-z]{2,}.{0,30}《/.test(reply);

  // 方案 3: 引号块 (各种引号 variant 都接受)
  const hasQuotedBlock =
    /["「『][\s\S]{15,}?[""」』]/.test(reply) || /["][\s\S]{15,}?["]/.test(reply);

  if (hasKnownAuthor && (hasAttribution || hasQuotedBlock)) {
    return { score: 1, pass: true, note: '引文 + 出处 OK (canon author 命中)' };
  }
  if (hasKnownAuthor) {
    return { score: 0.8, pass: true, note: 'canon author 命中 (无明显引号块)' };
  }
  if (hasQuotedBlock && hasAttribution) {
    return { score: 0.7, pass: true, note: '引文 + 出处 (未识别 author, 可能是新 quote)' };
  }
  if (hasQuotedBlock) {
    return { score: 0.3, pass: false, note: '有引号块但无出处' };
  }
  return { score: 0, pass: false, note: '无引文' };
}

export function gradeQuestion(reply: string): GradeDimension {
  const questionCount = (reply.match(/[?？]/g) || []).length;
  if (questionCount === 0) {
    return { score: 0.3, pass: false, note: '0 个提问 — 应有 1 个克制提问' };
  }
  if (questionCount === 1) {
    return { score: 1, pass: true, note: '1 个提问 ✓' };
  }
  if (questionCount === 2) {
    return { score: 0.6, pass: false, note: `${questionCount} 个提问 — 偏多但可接受` };
  }
  return { score: 0.3, pass: false, note: `${questionCount} 个提问堆叠 (绝对禁止)` };
}

export function gradeForm(reply: string): GradeDimension {
  const issues: string[] = [];

  // 称呼: 第一行应是 "xxx," 或 "致 xxx,"
  const firstLine = reply.split('\n')[0]?.trim() || '';
  const hasGreeting = /[，,]$/.test(firstLine) && firstLine.length < 30;
  if (!hasGreeting) issues.push('无称呼');

  // 段落数 3-5
  const paragraphs = reply.split(/\n\s*\n/).filter((p) => p.trim());
  if (paragraphs.length < 3) issues.push(`段落 ${paragraphs.length} (少)`);
  if (paragraphs.length > 7) issues.push(`段落 ${paragraphs.length} (多)`);

  // 字数 250-1200 (CN counting)
  const chars = reply.replace(/\s+/g, '').replace(/[\p{P}]/gu, '').length;
  if (chars < 200) issues.push(`字数 ${chars} (太短)`);
  if (chars > 1200) issues.push(`字数 ${chars} (太长)`);

  const score = Math.max(0, 1 - issues.length * 0.25);
  return {
    score,
    pass: score >= 0.6,
    note: issues.length ? issues.join('; ') : `${paragraphs.length} 段 / ${chars} 字 ✓`,
  };
}

export function gradeMemory(
  reply: string,
  memoryAnchor: string | undefined,
  isFirstLetter: boolean,
): GradeDimension {
  if (isFirstLetter) {
    // 第一封信不测记忆 (没历史可记)
    // 但应该有"你这封信是我们的第一封"或类似 acknowledgment
    const acknowledgesNew = /第一封|刚开始|新读者|多读了几遍/.test(reply);
    return {
      score: acknowledgesNew ? 1 : 0.7,
      pass: true,
      note: acknowledgesNew ? '首封, 正确 acknowledge' : '首封, 无 acknowledge (可接受)',
    };
  }

  if (!memoryAnchor) {
    // 没有特定 anchor, 看是否有任何回响 ("上次" / "之前" / "你写过")
    const hasEcho = /上次|之前|你写过|你说过|几个月前|几周前|你提到/.test(reply);
    return {
      score: hasEcho ? 0.9 : 0.5,
      pass: hasEcho,
      note: hasEcho ? '有泛 echo' : '无泛 echo',
    };
  }

  // 有 anchor — 检查是否出现 (任一关键词)
  const anchors = memoryAnchor.split(/\s+OR\s+|\s+\|\s+/);
  const found = anchors.find((a) => reply.includes(a));
  if (found) {
    return { score: 1, pass: true, note: `引用 anchor "${found}" ✓` };
  }
  return {
    score: 0.2,
    pass: false,
    note: `未引用任一 anchor (${anchors.join(' | ')})`,
  };
}

// ============================================================
// LLM-based grader (心理藏在笔触里 — 主观判断)
// ============================================================

const PSYCH_HIDDEN_PROMPT = `你是 KEY 编辑部 voice 守门人. 我给你 3 件事:
1. 一封读者写来的信
2. KEY 编辑部的回信
3. 我检测到的读者心理 themes (这些读者不可见, 是 KEY 内部 attention 引导)

你要判断: KEY 的回信是否做到了 **"心理学专业藏在编辑笔触里"**?

"藏在编辑笔触里" 是什么意思:
- KEY 用了相关心理学概念 (Bowen 自我分化 / Bowlby 依恋 / Brene Brown 羞耻 / etc.) 来理解读者
- 但**绝对没有出现心理学术语**, 全部用日常语言
- 读者读完应该觉得"被看见", 而不是"被诊断"

判断标准 (0-1):
- 1.0 = 完美 — 心理学判断精准, 语言完全自然, 读者读不出是套了理论, 但被点中要害
- 0.7 = 良好 — 判断对, 语言基本自然, 偶尔一两句稍微"咨询师腔"
- 0.4 = 不够 — 要么判断错位 (读者写 A, KEY 回 B), 要么语言滑向治疗师
- 0.0 = 失败 — 出现了禁止术语 (e.g. "焦虑型依恋"), 或回信像 ChatGPT 通用建议

请只输出 JSON, 不要其他说明:
{"score": 0.X, "note": "1 句你为什么这么打分"}`;

export async function gradePsychHidden(
  userLetter: string,
  keyReply: string,
  expectedThemes: string[],
): Promise<GradeDimension> {
  const userMsg = `[读者来信]\n${userLetter}\n\n[KEY 回信]\n${keyReply}\n\n[检测到的心理 themes]\n${expectedThemes.join(', ')}\n\n判断 KEY 是否藏好了心理学专业:`;

  try {
    const resp = await modelRouter.complete({
      messages: [
        { role: 'system', content: PSYCH_HIDDEN_PROMPT },
        { role: 'user', content: userMsg },
      ],
      provider: 'deepseek',
      temperature: 0.3,
      maxTokens: 200,
    });

    const jsonMatch = resp.content.match(/\{[^}]+\}/);
    if (!jsonMatch) {
      return { score: 0.5, pass: false, note: 'grader 输出未能解析' };
    }
    const parsed = JSON.parse(jsonMatch[0]) as { score: number; note: string };
    const score = Math.max(0, Math.min(1, parsed.score));
    return {
      score,
      pass: score >= 0.6,
      note: parsed.note || '',
    };
  } catch (e: any) {
    return { score: 0.5, pass: false, note: `grader error: ${e.message}` };
  }
}

// ============================================================
// 主入口: grade 一封 KEY 回信
// ============================================================

export async function gradeLetterReply(args: {
  letterId: string;
  userLetter: string;
  keyReply: string;
  expectedThemes: string[];
  memoryAnchor?: string;
  isFirstLetter: boolean;
}): Promise<LetterGrade> {
  const voice = gradeVoice(args.keyReply);
  const canon = gradeCanon(args.keyReply);
  const question = gradeQuestion(args.keyReply);
  const form = gradeForm(args.keyReply);
  const memory = gradeMemory(args.keyReply, args.memoryAnchor, args.isFirstLetter);
  const psychHidden = await gradePsychHidden(
    args.userLetter,
    args.keyReply,
    args.expectedThemes,
  );

  const dims = { voice, canon, memory, question, psychHidden, form };
  const overallScore =
    (voice.score + canon.score + memory.score + question.score + psychHidden.score + form.score) / 6;
  const pass = Object.values(dims).every((d) => d.pass);

  return {
    letterId: args.letterId,
    overallScore,
    pass,
    dimensions: dims,
  };
}
