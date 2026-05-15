/**
 * Admin sessions · cookie issuing + verifying
 *
 * Cookie format (v2): `v2:<admin_id>:<issued_at>:<sig>`
 *   - admin_id: user_xxxxx
 *   - issued_at: unix sec
 *   - sig: HMAC-SHA256(secret, "v2:<admin_id>:<issued_at>").hex.slice(0, 32)
 *   - secret: from admin-config.json _meta.sessionSecret
 *
 * 7 天过期. cookie 名: admin_session (跟旧 admin_auth 改名, 避免新老 cookie 互相干扰)
 */

import crypto from 'crypto';
import { loadAdminConfig } from './users-store';

export const SESSION_COOKIE_NAME = 'admin_session';
export const SESSION_MAX_AGE_SEC = 7 * 24 * 60 * 60; // 7 days

interface SessionPayload {
  adminId: string;
  issuedAt: number;
}

/**
 * 生成 session cookie value 给已登录用户.
 */
export function makeSessionCookie(adminId: string): string {
  const secret = getSessionSecret();
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = `v2:${adminId}:${issuedAt}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex').slice(0, 32);
  return `${payload}:${sig}`;
}

/**
 * 验证 cookie + 解析出 admin_id. 返回 null = 无效.
 */
export function verifySessionCookie(cookieValue: string | undefined): SessionPayload | null {
  if (!cookieValue) return null;
  const secret = getSessionSecret();
  if (!secret) return null;

  const parts = cookieValue.split(':');
  if (parts.length !== 4) return null;
  const [version, adminId, issuedAtStr, sig] = parts;
  if (version !== 'v2') return null;

  const issuedAt = parseInt(issuedAtStr, 10);
  if (isNaN(issuedAt)) return null;

  // expired?
  const now = Math.floor(Date.now() / 1000);
  if (now - issuedAt > SESSION_MAX_AGE_SEC) return null;

  // sig?
  const payload = `${version}:${adminId}:${issuedAt}`;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex').slice(0, 32);
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }

  return { adminId, issuedAt };
}

function getSessionSecret(): string {
  const cfg = loadAdminConfig();
  return cfg._meta.sessionSecret || '';
}
