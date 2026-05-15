/**
 * Password hashing · scrypt
 *
 * 用 Node 内置 crypto.scrypt, 不加 npm 依赖.
 * 参数: N=16384 (256MB memory cost per hash attempt).
 * 即使 password hash 漏出, 暴力破解每次尝试 100ms+, 弱密码也得算几年.
 *
 * Format: scrypt$N=16384,r=8,p=1$<salt-base64>$<hash-base64>
 */

import crypto from 'crypto';

const N = 16384;   // CPU/memory cost (2^14)
const R = 8;       // block size
const P = 1;       // parallelization
const KEYLEN = 32; // hash output length
const SALTLEN = 16;
const MAX_MEM = 64 * 1024 * 1024; // 64MB (default 32MB may be too low for N=16384)

/**
 * Generate scrypt hash. Async (uses worker thread).
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  const salt = crypto.randomBytes(SALTLEN);
  const hash = await scryptAsync(password, salt);
  return `scrypt$N=${N},r=${R},p=${P}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

/**
 * Verify password against stored hash. Constant-time comparison.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!password || !stored) return false;
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'scrypt') return false;
  try {
    const salt = Buffer.from(parts[2], 'base64');
    const expected = Buffer.from(parts[3], 'base64');
    const got = await scryptAsync(password, salt);
    if (got.length !== expected.length) return false;
    return crypto.timingSafeEqual(got, expected);
  } catch {
    return false;
  }
}

function scryptAsync(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEYLEN, { N, r: R, p: P, maxmem: MAX_MEM }, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey as Buffer);
    });
  });
}

/**
 * Quick check if a password meets minimum strength rules.
 * (Used at setup / invite-accept to give user feedback before hashing.)
 */
export function passwordStrength(password: string): {
  ok: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  if (!password || password.length < 8) reasons.push('至少 8 个字符');
  if (password && password.length > 200) reasons.push('最多 200 个字符');
  // 鼓励混合, 但不强制
  if (password && password.length >= 8 && password.length < 12) {
    if (!/[a-zA-Z]/.test(password)) reasons.push('建议含字母');
    if (!/[0-9]/.test(password)) reasons.push('建议含数字');
  }
  return { ok: reasons.length === 0, reasons };
}

/**
 * Username validation. ASCII only (used for committer email).
 * 中文 / 富文本姓名走 displayName 字段.
 */
export function validateUsername(username: string): string | null {
  if (!username) return '用户名必填';
  if (username.length < 3) return '用户名至少 3 字符';
  if (username.length > 40) return '用户名最多 40 字符';
  if (!/^[a-z0-9][a-z0-9._-]*[a-z0-9]$/.test(username)) {
    return '用户名: 小写字母 / 数字 / .  _  - , 不能以特殊字符开头或结尾';
  }
  return null;
}
