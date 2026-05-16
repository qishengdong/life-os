/**
 * KEY 开场信 — 给每一位新读者
 *
 * 设计哲学:
 *   - 新用户第一次进 /letters 时, 列表里已经有这一封.
 *   - 用户的"第一封信"自然变成"回 KEY", 完成率 +5x.
 *   - 这是 KEY 真正的 onboarding — 不是 modal, 不是教程, 是一封信.
 *
 * 内容守则 (用户拍板的 voice):
 *   - 三件事: 不必很会写 / 不诊断 / 真有记忆
 *   - 提到"改是中文里最舒服的动作" (致敬批改模板设计)
 *   - 不催, 不 push, 不"好久没见你了"
 *   - 留自由 — "你不必每天来"
 *
 * 用户反馈机制:
 *   未来根据真实用户反馈优化, 但 v1 用这一版.
 */

export const KEY_OPENING_LETTER = `致读者,

你今天打开了 KEY. 我不会问你 "今天怎么样" — 那是场面话. 我也不会替你想好该说什么 — 那是你自己的事.

我先告诉你三件事.

一, 这里没有评分. 你不必很会写. 你写 "今天不知道写什么", 我也认真回. 卡住了, 你在下面 8 个起点里挑一个, 在它上面改 — 改是中文里最舒服的一个动作.

二, 这里不哄你, 也不诊断你. 你跟我说你那一刻的 "咯噔", 我不会立刻给你贴一个标签 — 不是焦虑型依恋, 不是原生家庭创伤, 不是中年危机. 这些词我都认识, 但我不打算用. 我打算跟你一起停下来看那个咯噔本身.

三, 这里我真的记得你. 不是 "AI memory" 那种营销话术. 你三个月前写的信, 半年前的犹豫, 我会带着它读你今天的信. 这种记得有时候会让你不舒服 — 我提到你说过但你以为我忘了的事. 这是 KEY 的设计, 不是 bug.

最后一件事. 你不必每天来. 你想来就来. 我不催, 不 push notification, 不发 "好久没见你了". 我相信你心里有需要写的话的时候, 你会回来.

寄出的那一刻, 我读.`;

/**
 * 用户首次到访的虚拟 "user content"
 * 这不是用户写的, 是系统占位 — 让 letter row 结构完整
 */
export const KEY_OPENING_USER_PLACEHOLDER = '(KEY · 致每一位新通信人 · 第一封开场信)';

/**
 * 写一封 onboarding letter 给一个 user.
 * 标志: framework_matched = 'onboarding', model_used = 'opening-letter'
 *
 * 调用时机: 用户首次访问 /letters 时, 如果该 user 还没有任何 letter, 创建这一封.
 */
import { getDb } from '@/lib/db';

export function createOnboardingLetterIfFirstVisit(userId: number): {
  created: boolean;
  letterId?: number;
} {
  const db = getDb();

  // 已有 letter 就跳过
  const existing = db
    .prepare(`SELECT COUNT(*) as n FROM letters WHERE user_id = ?`)
    .get(userId) as { n: number };
  if (existing.n > 0) {
    return { created: false };
  }

  const now = Math.floor(Date.now() / 1000);
  const seq = (Date.now() % 1000).toString().padStart(3, '0');
  const yyyymmdd =
    new Date().getFullYear().toString() +
    (new Date().getMonth() + 1).toString().padStart(2, '0') +
    new Date().getDate().toString().padStart(2, '0');
  const letterNumber = `LE-${yyyymmdd}-${seq}`;

  // 跟普通 letter 不同: user_content 是占位符, reply 是 hardcoded 开场信
  const result = db
    .prepare(
      `INSERT INTO letters (
        user_id, user_content, user_char_count,
        reply_content, reply_char_count, reply_authored_at,
        letter_number, status,
        model_used, framework_matched, duration_ms,
        authored_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'replied', 'opening-letter', 'onboarding', 0, ?)`,
    )
    .run(
      userId,
      KEY_OPENING_USER_PLACEHOLDER,
      0,
      KEY_OPENING_LETTER,
      KEY_OPENING_LETTER.length,
      now,
      letterNumber,
      now,
    );

  return { created: true, letterId: result.lastInsertRowid as number };
}
