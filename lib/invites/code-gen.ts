/**
 * Invite code generation.
 *
 * 格式: KE-XXXX-XXXX (10 字符 + 2 横线)
 * 字符集 (32 字符, 去掉易混淆): ABCDEFGHJKMNPQRSTUVWXYZ23456789
 *
 * 熵: 32^8 ≈ 1.1 × 10^12, 单用户级足够防暴力.
 *
 * Phase 1 (KEY rebrand): 前缀从 LO (LifeOS) → KE (KEY).
 * 历史 LO- 码已经发出过吗? 暂时没有真实用户兑换. 兼容验证仍接受 LO- 旧码.
 */

import crypto from 'crypto';

// 去掉 0/O/1/I/L 等易混淆字符
const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const PREFIX = 'KE';

/**
 * 生成一个新邀请码.
 * 注意: 调用方需自行验证 db 里不重复 (理论上 10^12 概率, 但稳健起见在 store 层 retry).
 */
export function generateInviteCode(): string {
  const bytes = crypto.randomBytes(8);
  const chars: string[] = [];
  for (let i = 0; i < 8; i++) {
    chars.push(CHARSET[bytes[i] % CHARSET.length]);
  }
  return `${PREFIX}-${chars.slice(0, 4).join('')}-${chars.slice(4, 8).join('')}`;
}

/**
 * 校验邀请码格式.
 * 注意: 仅校验"看起来对", 不校验是否存在于 db.
 */
export function isValidInviteCodeFormat(code: string): boolean {
  // Accept both new KE- and legacy LO- (no production codes issued yet, but defensive)
  return /^(KE|LO)-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(code);
}

/**
 * 把用户输入的码"清洗" — 转大写, 去空格, 容错短横线.
 */
export function normalizeInviteCode(input: string): string {
  const cleaned = input.toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9-]/g, '');
  // 如果用户漏了横线, 自动补 (10 位 → KE-XXXX-XXXX or LO-XXXX-XXXX)
  if (/^(KE|LO)[A-Z2-9]{8}$/.test(cleaned)) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
  }
  return cleaned;
}
