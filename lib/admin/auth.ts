/**
 * Admin 认证 · V2 (username + password + multi-user)
 *
 * 主接口:
 *   - getAdminFromRequest(req) → AdminUser | null
 *   - requireAdmin(req) → AdminUser | NextResponse (401)
 *   - requireOwner(req) → AdminUser | NextResponse (401/403)
 *
 * Cookie:
 *   admin_session = v2:<adminId>:<issuedAt>:<sig>
 *   HMAC 用 admin-config.json _meta.sessionSecret · 7 天过期
 *
 * 向后兼容:
 *   - 老 admin_auth cookie (v1) 不再认 → 老 session 自动失效, 用户重新登录
 *   - ADMIN_TOKEN env var: 仅 setup API 用做 bootstrap 防护 (防止陌生人首次随便创 owner)
 *   - 老 export (ADMIN_COOKIE_NAME / verifyAdminCookie / isAdminConfigured) 保留, 内部转新逻辑
 *
 * Roles:
 *   - 'owner': 全权限 + 管账号
 *   - 'editor': CMS 改 + publish, 不能管账号
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SEC,
  verifySessionCookie,
  makeSessionCookie,
} from './sessions';
import {
  findUserById,
  isSetupCompleted,
  type AdminUser,
  type AdminRole,
} from './users-store';

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SEC, makeSessionCookie };

// ============================================================================
// Backward-compat exports
// ============================================================================
export const ADMIN_COOKIE_NAME = SESSION_COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE = SESSION_MAX_AGE_SEC;

/**
 * @deprecated 老 boolean 接口 — 现在等价于 getAdminFromRequest 是否非空.
 * 现有 API routes 还在用, 渐进迁移.
 */
export function verifyAdminCookie(cookieValue: string | undefined): boolean {
  const payload = verifySessionCookie(cookieValue);
  if (!payload) return false;
  const user = findUserById(payload.adminId);
  return !!user && user.active;
}

/**
 * Admin 功能是否启用 + 已 setup.
 * 旧名兼容. 新逻辑: 检查是否有 owner 用户.
 */
export function isAdminConfigured(): boolean {
  return isSetupCompleted();
}

/**
 * @deprecated 老登录方式作废. 直接抛错, 防止误调用.
 */
export function makeAdminCookieValue(): string {
  throw new Error('makeAdminCookieValue() deprecated — use makeSessionCookie(adminId)');
}

/**
 * @deprecated 老 token-base 登录, 不再返回 true. 兼容保留以防 import.
 */
export function verifyAdminToken(_token: string): boolean {
  return false;
}

// ============================================================================
// V2 主接口
// ============================================================================

/**
 * 解析 request 拿到当前登录的 admin user. 失败返回 null.
 */
export function getAdminFromRequest(req: NextRequest): AdminUser | null {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const payload = verifySessionCookie(cookie);
  if (!payload) return null;
  const user = findUserById(payload.adminId);
  if (!user || !user.active) return null;
  return user;
}

/**
 * 校验登录 + 任意角色. 返回 user 或 NextResponse(401).
 *
 * 用法:
 *   const auth = requireAdmin(req);
 *   if (auth instanceof NextResponse) return auth;
 *   // auth 是 AdminUser
 */
export function requireAdmin(req: NextRequest): AdminUser | NextResponse {
  const user = getAdminFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return user;
}

/**
 * 校验登录 + Owner 角色.
 */
export function requireOwner(req: NextRequest): AdminUser | NextResponse {
  const result = requireAdmin(req);
  if (result instanceof NextResponse) return result;
  if (result.role !== 'owner') {
    return NextResponse.json({ error: 'owner role required' }, { status: 403 });
  }
  return result;
}

/**
 * 校验某角色清单中任一.
 */
export function requireRole(
  req: NextRequest,
  roles: AdminRole[],
): AdminUser | NextResponse {
  const result = requireAdmin(req);
  if (result instanceof NextResponse) return result;
  if (!roles.includes(result.role)) {
    return NextResponse.json({ error: `role ${roles.join('/')} required` }, { status: 403 });
  }
  return result;
}
