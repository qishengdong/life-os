/**
 * Admin 认证 — V0 简化方案: ADMIN_TOKEN env var + HTTP-only cookie.
 *
 * 设计:
 *   - 创始人在 .env.local 设 ADMIN_TOKEN=<random-long-string>
 *   - /admin/login 验证 token 后, 设 cookie admin_auth=<signed-token>
 *   - signed-token = HMAC(token, ADMIN_TOKEN-as-secret) — 老 token 改了, 老 cookie 自动失效
 *   - 7 天过期
 *
 * V1+ 升级方向: 多 admin 用户, OAuth, audit log who did what.
 */

import crypto from 'crypto';

const COOKIE_NAME = 'admin_auth';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days, seconds

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE = COOKIE_MAX_AGE;

/**
 * 验证 token 是否匹配 env ADMIN_TOKEN.
 */
export function verifyAdminToken(token: string): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || expected.length < 8) return false;
  if (!token || token.length < 8) return false;
  // 常量时间比较, 防 timing 攻击
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * 生成 cookie 值 (HMAC-SHA256, 用 ADMIN_TOKEN 自己做 secret).
 * 这样改 ADMIN_TOKEN, 所有老 cookie 立刻失效.
 */
export function makeAdminCookieValue(): string {
  const secret = process.env.ADMIN_TOKEN || '';
  if (!secret) throw new Error('ADMIN_TOKEN env var not set');
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = `v1:${issuedAt}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex').slice(0, 32);
  return `${payload}:${sig}`;
}

/**
 * 验证 cookie 值是否还有效.
 */
export function verifyAdminCookie(cookieValue: string | undefined): boolean {
  const secret = process.env.ADMIN_TOKEN;
  if (!secret || secret.length < 8) return false;
  if (!cookieValue) return false;

  const parts = cookieValue.split(':');
  if (parts.length !== 3) return false;
  const [version, issuedAtStr, sig] = parts;
  if (version !== 'v1') return false;

  const issuedAt = parseInt(issuedAtStr, 10);
  if (isNaN(issuedAt)) return false;

  // 过期检查
  const now = Math.floor(Date.now() / 1000);
  if (now - issuedAt > COOKIE_MAX_AGE) return false;

  // 签名检查
  const payload = `${version}:${issuedAt}`;
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex').slice(0, 32);
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

/**
 * Admin 功能是否启用 (env 是否配齐).
 */
export function isAdminConfigured(): boolean {
  const t = process.env.ADMIN_TOKEN;
  return !!t && t.length >= 8;
}
