/**
 * Recovery code · 真用户身份 V1 self-recovery 主线 (ICP 来之前 SMS / 微信 OAuth 不可用)
 *
 * 设计:
 *   - 格式: KEY-XXXX-XXXX (10 字, base32, 排除歧义字符 1/I/0/O/L)
 *   - 兑换邀请码完成时生成一次, 屏幕显示, 强制用户 confirm "我已截图" 才能进入产品
 *   - 用户换设备时去 /recover 输入恢复码 + 当前 device 的 localStorage UUID
 *     → server 把 user.user_uid swap 到新 UUID, 历史数据 (decision/brain/letter) 自动跟着新设备
 *   - 用户丢恢复码 → 加 admin 微信 → admin 后台手填 user.wechat_id + 帮 swap UUID
 *
 * V2 (ICP 下来后): SMS OTP / 微信 OAuth 覆盖 self-recovery, 这套 code 仍作 backup channel.
 */
import { randomBytes } from 'crypto';
import { getDb } from '@/lib/db';

// base32 alphabet, 排除歧义: 0 vs O, 1 vs I vs L
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // 31 chars
const SEGMENT_LEN = 4;

/** 生成 KEY-XXXX-XXXX 形式恢复码. */
export function generateRecoveryCode(): string {
  const bytes = randomBytes(SEGMENT_LEN * 2);
  const chars: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    chars.push(ALPHABET[bytes[i] % ALPHABET.length]);
  }
  return `KEY-${chars.slice(0, SEGMENT_LEN).join('')}-${chars.slice(SEGMENT_LEN).join('')}`;
}

/**
 * 生成 + 写入 user.recovery_code · 邀请兑换完成时调.
 * 已有 code 不覆盖 (idempotent).
 * 返回当前生效的 code (新生成 or 已存的).
 */
export async function ensureRecoveryCode(userId: number): Promise<string> {
  const db = await getDb();
  const existing = (await db
    .prepare(`SELECT recovery_code FROM users WHERE id = ?`)
    .get(userId)) as { recovery_code: string | null } | undefined;
  if (existing?.recovery_code) return existing.recovery_code;

  // 重试一次防极小概率碰撞 (UNIQUE index 兜底)
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateRecoveryCode();
    try {
      await db.prepare(`UPDATE users SET recovery_code = ? WHERE id = ?`).run(code, userId);
      return code;
    } catch (e: any) {
      if (!String(e?.message).includes('UNIQUE')) throw e;
    }
  }
  throw new Error('Failed to generate unique recovery_code after 3 attempts');
}

/** 标记用户已 confirm "我已截图" (确保用户真看到 + 保存了). */
export async function acknowledgeRecoveryCode(userId: number): Promise<void> {
  const db = await getDb();
  await db.prepare(`UPDATE users SET recovery_code_acknowledged_at = unixepoch() WHERE id = ?`).run(userId);
}

/**
 * 用恢复码 swap user_uid · /recover 流程核心.
 * 返回 { userId, oldUid, newUid } or null (code 不存在).
 */
export async function swapUserUidByRecoveryCode(args: {
  recoveryCode: string;
  newUserUid: string;
}): Promise<{ userId: number; oldUid: string | null; newUid: string } | null> {
  const db = await getDb();
  const code = normalizeRecoveryCode(args.recoveryCode);
  const row = (await db
    .prepare(`SELECT id, user_uid FROM users WHERE recovery_code = ?`)
    .get(code)) as { id: number; user_uid: string | null } | undefined;
  if (!row) return null;

  await db.prepare(`UPDATE users SET user_uid = ?, last_active_at = unixepoch() WHERE id = ?`).run(
    args.newUserUid,
    row.id,
  );
  return { userId: row.id, oldUid: row.user_uid, newUid: args.newUserUid };
}

/** 用户输入可能含空格 / 小写 / 中划线变体, 标准化. */
export function normalizeRecoveryCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '').replace(/–|—|_/g, '-');
}

/** 检查 user 是否已 acknowledged recovery code (没 ack 不让进 product routes). */
export async function hasAcknowledgedRecoveryCode(userId: number): Promise<boolean> {
  const db = await getDb();
  const row = (await db
    .prepare(`SELECT recovery_code_acknowledged_at FROM users WHERE id = ?`)
    .get(userId)) as { recovery_code_acknowledged_at: number | null } | undefined;
  return !!row?.recovery_code_acknowledged_at;
}
