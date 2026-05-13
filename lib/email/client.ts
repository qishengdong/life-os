/**
 * Email Client — V0 dry-run mode + V1 SMTP
 *
 * V0 dev: 没设 SMTP env vars 时, 邮件只写 emails_sent (status='dry-run') + console.log
 * V1 prod: 设了 EMAIL_SMTP_HOST/USER/PASS 后, 用 Nodemailer 真发
 *
 * 兼容服务商:
 *   - 网易企业邮 (smtp.qiye.163.com:465 SSL)
 *   - 腾讯企业邮 (smtp.exmail.qq.com:465 SSL)
 *   - 阿里云邮 (smtp.dm.aliyun.com:465 SSL)
 *   - Gmail (smtp.gmail.com:587 TLS, 需 app password)
 *   - Resend SMTP (smtp.resend.com:465, user 'resend')
 *
 * Env vars:
 *   EMAIL_SMTP_HOST       SMTP 服务器
 *   EMAIL_SMTP_PORT       端口 (465/587)
 *   EMAIL_SMTP_USER       用户名 (通常是邮箱)
 *   EMAIL_SMTP_PASS       密码 / app password
 *   EMAIL_FROM            发件人 (例: "KEY <hi@lifeos.cn>")
 *   EMAIL_DRY_RUN         '1' 强制 dry-run (即使配了 SMTP)
 */

import { getDb } from '@/lib/db';
import nodemailer, { type Transporter } from 'nodemailer';

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.EMAIL_SMTP_HOST;
  const user = process.env.EMAIL_SMTP_USER;
  const pass = process.env.EMAIL_SMTP_PASS;
  if (!host || !user || !pass) return null;

  const port = parseInt(process.env.EMAIL_SMTP_PORT || '465');
  const secure = port === 465;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
  return cachedTransporter;
}

export function isEmailConfigured(): boolean {
  if (process.env.EMAIL_DRY_RUN === '1') return false;
  return !!getTransporter();
}

export function getSendMode(): 'dry-run' | 'smtp' {
  return isEmailConfigured() ? 'smtp' : 'dry-run';
}

export interface SendArgs {
  userId: number;
  emailType: 'welcome' | 'sunday_review' | 'outcome_due' | 'commitment_reminder';
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface SendResult {
  emailId: number;
  status: 'sent' | 'failed' | 'dry-run';
  mode: 'dry-run' | 'smtp';
  providerMessageId?: string;
  error?: string;
}

export async function sendEmail(args: SendArgs): Promise<SendResult> {
  const db = getDb();
  const mode = getSendMode();
  const from = process.env.EMAIL_FROM || 'KEY <noreply@lifeos.local>';

  // 1. 写入 emails_sent (status='queued')
  const result = db
    .prepare(
      `INSERT INTO emails_sent (user_id, email_type, recipient, subject, body_text, body_html, send_mode, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'queued')`
    )
    .run(
      args.userId,
      args.emailType,
      args.to,
      args.subject,
      args.text,
      args.html ?? null,
      mode
    );
  const emailId = result.lastInsertRowid as number;

  // 2. 发 (or dry-run)
  if (mode === 'dry-run') {
    // dry-run: 仅 log + 更新 status
    console.log(`[email][DRY-RUN] To: ${args.to} | Subject: ${args.subject}`);
    console.log(`[email][DRY-RUN] First 200 chars of body:\n${args.text.slice(0, 200)}...`);
    db.prepare(
      `UPDATE emails_sent SET status = 'dry-run', sent_at = unixepoch() WHERE id = ?`
    ).run(emailId);
    return { emailId, status: 'dry-run', mode: 'dry-run' };
  }

  // 真发
  const transporter = getTransporter()!;
  try {
    const info = await transporter.sendMail({
      from,
      to: args.to,
      subject: args.subject,
      text: args.text,
      html: args.html,
    });
    db.prepare(
      `UPDATE emails_sent SET status = 'sent', provider_message_id = ?, sent_at = unixepoch() WHERE id = ?`
    ).run(info.messageId, emailId);
    return {
      emailId,
      status: 'sent',
      mode: 'smtp',
      providerMessageId: info.messageId,
    };
  } catch (e: any) {
    db.prepare(
      `UPDATE emails_sent SET status = 'failed', error_message = ?, sent_at = unixepoch() WHERE id = ?`
    ).run(e.message, emailId);
    return {
      emailId,
      status: 'failed',
      mode: 'smtp',
      error: e.message,
    };
  }
}

/**
 * 查邮件历史 (admin / 自助查看)
 */
export function getEmailsForUser(userId: number, limit = 50) {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, email_type, recipient, subject, send_mode, status, sent_at, opened_at, error_message, created_at
       FROM emails_sent
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ?`
    )
    .all(userId, limit);
}
