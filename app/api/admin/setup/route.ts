/**
 * /api/admin/setup
 *
 * GET  → 返回是否需要 setup (setupCompleted? )
 * POST → 首次创建 Owner 用户. 仅在没有 owner 时可用; 之后接口失效.
 *
 * Bootstrap 保护:
 *   - 没 ADMIN_TOKEN env → 任何人首次能 setup (本地 dev OK)
 *   - 有 ADMIN_TOKEN env → POST 必须带正确 bootstrapKey (= ADMIN_TOKEN), 防陌生人随便创号
 *     这跟"用 ADMIN_TOKEN 登录"不同 — 这只是一次性 bootstrap 保护
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword, validateUsername, passwordStrength } from '@/lib/admin/passwords';
import {
  loadAdminConfig,
  saveAdminConfig,
  isSetupCompleted,
  generateUserId,
  makeCommitterEmail,
  invalidateCache,
} from '@/lib/admin/users-store';
import { makeSessionCookie, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SEC } from '@/lib/admin/sessions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// ============================================================================
// GET — 状态
// ============================================================================

export async function GET() {
  return NextResponse.json({
    setupCompleted: isSetupCompleted(),
    bootstrapKeyRequired: !!process.env.ADMIN_TOKEN,
  });
}

// ============================================================================
// POST — 创建第一个 Owner
// ============================================================================

const Body = z.object({
  username: z.string(),
  displayName: z.string().min(1).max(40),
  password: z.string().min(8).max(200),
  bootstrapKey: z.string().optional(),
});

export async function POST(req: NextRequest) {
  // 1. setup 已完成 → 拒绝
  if (isSetupCompleted()) {
    return NextResponse.json(
      { error: 'setup 已完成. 用 /admin/login 登录, 或让 owner 给你发邀请链接' },
      { status: 400 },
    );
  }

  // 2. validate body
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || 'invalid input' },
      { status: 400 },
    );
  }
  const { username, displayName, password, bootstrapKey } = parsed.data;

  // 3. username 校验
  const usernameErr = validateUsername(username);
  if (usernameErr) {
    return NextResponse.json({ error: usernameErr }, { status: 400 });
  }
  const norm = username.toLowerCase();

  // 4. password 强度
  const strength = passwordStrength(password);
  if (!strength.ok) {
    return NextResponse.json({ error: '密码: ' + strength.reasons.join(', ') }, { status: 400 });
  }

  // 5. bootstrap 保护
  const requiredBootstrap = process.env.ADMIN_TOKEN;
  if (requiredBootstrap && requiredBootstrap.length >= 8) {
    if (!bootstrapKey || bootstrapKey !== requiredBootstrap) {
      return NextResponse.json(
        {
          error:
            'Setup 需要 bootstrap key. 把 Vercel project 里的 ADMIN_TOKEN 值贴到 "Bootstrap Key" 字段, 完成首次 setup 后该字段失效.',
        },
        { status: 403 },
      );
    }
  }

  // 6. 创建 owner
  const cfg = loadAdminConfig();
  const userId = generateUserId();
  const email = makeCommitterEmail(norm);
  const now = Math.floor(Date.now() / 1000);

  const passwordHash = await hashPassword(password);

  cfg.users.push({
    id: userId,
    username: norm,
    displayName,
    passwordHash,
    role: 'owner',
    email,
    createdAt: now,
    lastLoginAt: now,
    active: true,
  });
  cfg._meta.setupCompleted = true;
  cfg._meta.setupAt = now;

  // 7. save (本地 + GitHub commit)
  try {
    await saveAdminConfig(cfg, {
      commitMessage: `admin: setup first owner (${displayName})`,
      author: { username: norm, displayName, email },
    });
  } catch (e: any) {
    return NextResponse.json({ error: `保存失败: ${e.message}` }, { status: 500 });
  }
  invalidateCache();

  // 8. 直接登录 → set cookie
  const sessionCookie = makeSessionCookie(userId);
  const res = NextResponse.json({
    success: true,
    user: { id: userId, username: norm, displayName, role: 'owner', email },
  });
  res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SEC,
    path: '/',
  });
  return res;
}
