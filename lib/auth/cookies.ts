/**
 * 真用户身份 V1 cookies · soft UX gate (middleware redirect).
 *
 * 不签名 (内测期 100 人 + API 层有真 access_status 二次校验).
 * 仅作 middleware 重定向用 — 一个未邀请的随机访客打 /pulse 应跳回 /invite.
 *
 * V2 (ICP / SMS 后) 升级为 HMAC 签名 cookie.
 */
import { NextResponse } from 'next/server';

export const COOKIE_INVITED = 'key_invited';
export const COOKIE_ACKED = 'key_acked';

const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

/** Redeem 成功后调 · 标记用户已 invited (可访问 /onboarding 等). */
export function setInvitedCookie(res: NextResponse): void {
  res.cookies.set({
    name: COOKIE_INVITED,
    value: '1',
    httpOnly: false, // 中间件 + 客户端都读
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_YEAR_SECONDS,
  });
}

/** Acknowledge 恢复码后调 · 标记用户已截图 (可访问 /pulse /letters /decisions 等). */
export function setAckedCookie(res: NextResponse): void {
  res.cookies.set({
    name: COOKIE_ACKED,
    value: '1',
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_YEAR_SECONDS,
  });
}

/** Recover 成功后调 · 一次设两个 (恢复回来的用户必然 invited + 此前已 ack). */
export function setRecoveredCookies(res: NextResponse): void {
  setInvitedCookie(res);
  setAckedCookie(res);
}

/** Logout / 删除账户后 · 清两个 cookie. */
export function clearUserCookies(res: NextResponse): void {
  res.cookies.delete(COOKIE_INVITED);
  res.cookies.delete(COOKIE_ACKED);
}
