/**
 * POST /api/admin/email-test — 触发一封测试邮件
 *
 * 用途:
 *   - 配置完 SMTP env 后, 验证发件链路是否通
 *   - 仅当用户本人 (X-User-UID) 已绑 email 才发, 不开"发任意收件人"接口
 *   - 用一个独立模板 (不复用 welcome / sunday_review 调性), 内容明确说"这是一封测试"
 *
 * 鉴权:
 *   生产环境: 需 ADMIN_TOKEN env 匹配 Authorization Bearer
 *   开发环境: 没设 ADMIN_TOKEN 时允许直接调 (本地 dev 友好)
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { sendEmail, getSendMode, isEmailConfigured } from '@/lib/email/client';
import { getUser } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function buildTestEmail(args: { email: string; mode: 'dry-run' | 'smtp' }) {
  const subject = `KEY 邮件链路测试 — ${args.mode === 'smtp' ? 'SMTP' : 'dry-run'}`;
  const now = new Date().toLocaleString('zh-CN', { hour12: false });

  const text = `这是 KEY 的一封测试邮件.

如果你收到这封, 说明邮件发送通道已经打通.

  发送时间: ${now}
  发送模式: ${args.mode}
  收件人: ${args.email}

这封信不属于 Welcome / Sunday Review / Outcome Due / Commitment 任一正式信件 — 仅用于配置验证.

— KEY
陪你想清楚 · 看清代价 · 长期记得你`;

  const html = `<!DOCTYPE html><html><body style="font-family:'Source Han Serif SC',serif;background:#FAF7F2;color:#3A2E26;padding:32px;">
<h2 style="color:#9B2D27;border-bottom:2px solid #9B2D27;padding-bottom:8px;">KEY 邮件链路测试</h2>
<p>这是一封测试邮件. 如果你收到这封, 说明邮件发送通道已经打通.</p>
<table cellspacing="0" cellpadding="6" style="border-collapse:collapse;margin:16px 0;">
<tr><td style="color:#7A6A5C;">发送时间</td><td><strong>${now}</strong></td></tr>
<tr><td style="color:#7A6A5C;">发送模式</td><td><strong>${args.mode}</strong></td></tr>
<tr><td style="color:#7A6A5C;">收件人</td><td><strong>${args.email}</strong></td></tr>
</table>
<p style="color:#7A6A5C;font-size:13px;">这封信不属于任一正式信件, 仅用于配置验证.</p>
<hr style="border:none;border-top:1px solid #E5DDD2;margin:24px 0;">
<p style="color:#7A6A5C;font-size:12px;">陪你想清楚 · 看清代价 · 长期记得你</p>
</body></html>`;

  return { subject, text, html };
}

export async function POST(req: NextRequest) {
  // Admin token check (只在生产模式启用)
  const adminToken = process.env.ADMIN_TOKEN;
  if (adminToken) {
    const auth = req.headers.get('authorization');
    if (!auth || auth !== `Bearer ${adminToken}`) {
      return NextResponse.json({ error: '需要 admin token' }, { status: 401 });
    }
  }

  try {
    const { userId } = resolveUserId(req);
    const user = getUser(userId);
    if (!user?.email) {
      return NextResponse.json(
        { error: '当前用户没有设邮箱. 先去 /account 设邮箱再测.' },
        { status: 400 }
      );
    }

    const mode = getSendMode();
    const { subject, text, html } = buildTestEmail({ email: user.email, mode });

    const result = await sendEmail({
      userId,
      emailType: 'welcome', // 复用 welcome 类型, 测试信不另开 enum
      to: user.email,
      subject,
      text,
      html,
    });

    return NextResponse.json({
      success: true,
      result,
      smtpConfigured: isEmailConfigured(),
      mode,
      hint: mode === 'dry-run'
        ? '当前是 dry-run 模式 (没配 SMTP env). 内容已写入 emails_sent 表, 但没真发出去. 看 console log 验证内容. 配 EMAIL_SMTP_* env 后再调即可真发.'
        : '已用 SMTP 发出. 检查收件箱; 如果没收到看 emails_sent 表的 status / error_message.',
    });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET — 查邮件链路状态 (不发, 只读)
export async function GET(req: NextRequest) {
  try {
    const { userId } = resolveUserId(req);
    const user = getUser(userId);
    return NextResponse.json({
      currentUser: {
        userId,
        email: user?.email || null,
      },
      smtpConfigured: isEmailConfigured(),
      mode: getSendMode(),
      envHints: {
        hasHost: !!process.env.EMAIL_SMTP_HOST,
        hasUser: !!process.env.EMAIL_SMTP_USER,
        hasPass: !!process.env.EMAIL_SMTP_PASS,
        hasFrom: !!process.env.EMAIL_FROM,
        port: process.env.EMAIL_SMTP_PORT || '(默认 465)',
        dryRunForced: process.env.EMAIL_DRY_RUN === '1',
      },
    });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
