/**
 * Email Sender — 高层封装
 *
 * 检查用户订阅偏好 + 拉数据 + 调 template + 调 client.
 * 上层 (API / cron) 只需要调 sendXxx(userId) 即可.
 */

import { sendEmail, isEmailConfigured } from './client';
import {
  buildWelcomeEmail,
  buildSundayReviewEmail,
  buildOutcomeDueEmail,
  buildCommitmentEmail,
} from './templates';
import { getUser, getUserEmailPrefs } from '@/lib/db';
import { fetchUserMemory } from '@/lib/memory';

function appBaseUrl(): string {
  return process.env.APP_BASE_URL || 'http://localhost:3000';
}

function unsubUrl(userId: number, emailType: string): string {
  // V1.5 加真实 unsubscribe token
  return `${appBaseUrl()}/account?unsub=${emailType}`;
}

// ============================================================================
// sendWelcome
// ============================================================================
export async function sendWelcome(userId: number) {
  const user = await getUser(userId);
  if (!user?.email) return { skipped: true, reason: 'no email' };
  const prefs = await getUserEmailPrefs(userId);
  if (!prefs.welcome) return { skipped: true, reason: 'opted out' };

  const memory = await fetchUserMemory(userId);
  const brainSnippet = memory.brainContent
    ? memory.brainContent.slice(0, 400) + '...'
    : undefined;

  const { subject, text, html } = buildWelcomeEmail({
    brainSnippet,
    appUrl: appBaseUrl(),
    unsubscribeUrl: unsubUrl(userId, 'welcome'),
  });

  return sendEmail({
    userId,
    emailType: 'welcome',
    to: user.email,
    subject,
    text,
    html,
  });
}

// ============================================================================
// sendSundayReviewEmail
// ============================================================================
export async function sendSundayReviewNotification(args: {
  userId: number;
  weekStart: number;
  weekEnd: number;
  reviewContent: string;
  pulseCount: number;
}) {
  const user = await getUser(args.userId);
  if (!user?.email) return { skipped: true, reason: 'no email' };
  const prefs = await getUserEmailPrefs(args.userId);
  if (!prefs.sunday_review) return { skipped: true, reason: 'opted out' };

  // 节选 first 节 (Section 1 — 反复提到什么)
  const snippet = (() => {
    const match = args.reviewContent.match(/## 1\. 这周你反复提到什么\s*\n([\s\S]+?)(?=## 2\.|$)/);
    if (match) return match[1].trim().slice(0, 450) + '...';
    return args.reviewContent.slice(0, 450) + '...';
  })();

  const fmt = (ts: number) => {
    const d = new Date(ts * 1000);
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
  };
  const weekRangeLabel = `${fmt(args.weekStart)} → ${fmt(args.weekEnd)}`;

  const { subject, text, html } = buildSundayReviewEmail({
    weekRangeLabel,
    reviewSnippet: snippet,
    reviewUrl: `${appBaseUrl()}/review`,
    pulseCount: args.pulseCount,
    unsubscribeUrl: unsubUrl(args.userId, 'sunday_review'),
  });

  return sendEmail({
    userId: args.userId,
    emailType: 'sunday_review',
    to: user.email,
    subject,
    text,
    html,
  });
}

// ============================================================================
// sendOutcomeDueNotification
// ============================================================================
export async function sendOutcomeDueNotification(args: {
  userId: number;
  checkpointDays: number;
  decisionCreatedAt: number;
  decisionQuestion: string;
}) {
  const user = await getUser(args.userId);
  if (!user?.email) return { skipped: true, reason: 'no email' };
  const prefs = await getUserEmailPrefs(args.userId);
  if (!prefs.outcome_due) return { skipped: true, reason: 'opted out' };

  const decisionDate = new Date(args.decisionCreatedAt * 1000);
  const decisionDateLabel = `${decisionDate.getMonth() + 1} 月 ${decisionDate.getDate()} 日`;

  // 截断到 ~150 字
  const trimmedQuestion = args.decisionQuestion.length > 200
    ? args.decisionQuestion.slice(0, 200) + '...'
    : args.decisionQuestion;

  const { subject, text, html } = buildOutcomeDueEmail({
    checkpointDays: args.checkpointDays,
    decisionDateLabel,
    decisionQuestion: trimmedQuestion,
    outcomesUrl: `${appBaseUrl()}/outcomes`,
    unsubscribeUrl: unsubUrl(args.userId, 'outcome_due'),
  });

  return sendEmail({
    userId: args.userId,
    emailType: 'outcome_due',
    to: user.email,
    subject,
    text,
    html,
  });
}

// ============================================================================
// sendCommitmentReminder
// ============================================================================
export async function sendCommitmentReminderEmail(args: {
  userId: number;
  commitmentText: string;
  daysAgo: number;
}) {
  const user = await getUser(args.userId);
  if (!user?.email) return { skipped: true, reason: 'no email' };
  const prefs = await getUserEmailPrefs(args.userId);
  if (!prefs.commitment) return { skipped: true, reason: 'opted out' };

  const { subject, text, html } = buildCommitmentEmail({
    commitmentText: args.commitmentText,
    daysAgo: args.daysAgo,
    appUrl: appBaseUrl(),
    unsubscribeUrl: unsubUrl(args.userId, 'commitment'),
  });

  return sendEmail({
    userId: args.userId,
    emailType: 'commitment_reminder',
    to: user.email,
    subject,
    text,
    html,
  });
}

export { isEmailConfigured };
