/**
 * GET /api/admin/stats — admin 仪表板聚合数据
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminCookie,
  ADMIN_COOKIE_NAME,
  isAdminConfigured,
} from '@/lib/admin/auth';
import { getInviteSummary } from '@/lib/invites';
import { getBriefStats, getDimensionScores, getCheckStats } from '@/lib/grader/aggregations';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function adminGate(req: NextRequest): NextResponse | null {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: 'Admin disabled' }, { status: 503 });
  }
  const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminCookie(cookie)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const gate = adminGate(req);
  if (gate) return gate;

  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  const week = 7 * 86400;

  // 用户
  const userStats = db
    .prepare(
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN access_status = 'invited' THEN 1 ELSE 0 END) as invited,
         SUM(CASE WHEN access_status = 'guest' THEN 1 ELSE 0 END) as guest,
         SUM(CASE WHEN access_status = 'suspended' THEN 1 ELSE 0 END) as suspended,
         SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as new_this_week
       FROM users`
    )
    .get(now - week) as any;

  // Brief
  const briefStats = getBriefStats();
  const briefThisWeek = db
    .prepare(`SELECT COUNT(*) as n FROM decision_briefs WHERE authored_at >= ?`)
    .get(now - week) as any;

  // Pulse
  const pulseStats = db
    .prepare(`SELECT COUNT(*) as total FROM daily_pulses`)
    .get() as any;
  const pulseThisWeek = db
    .prepare(`SELECT COUNT(*) as n FROM daily_pulses WHERE created_at >= ?`)
    .get(now - week) as any;

  // 邀请
  const inviteSummary = getInviteSummary();

  // 邮件
  const emailStats = db
    .prepare(
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
         SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
         SUM(CASE WHEN status = 'dry-run' THEN 1 ELSE 0 END) as dryRun
       FROM emails_sent`
    )
    .get() as any;
  const emailThisMonth = db
    .prepare(`SELECT COUNT(*) as n FROM emails_sent WHERE created_at >= ?`)
    .get(now - 30 * 86400) as any;

  // 审计
  const checks = getCheckStats();
  const dims = getDimensionScores();
  const overallScore = dims.length
    ? dims.reduce((s, d) => s + d.avgScore, 0) / dims.length
    : 0;

  return NextResponse.json({
    users: {
      total: userStats?.total || 0,
      invited: userStats?.invited || 0,
      guest: userStats?.guest || 0,
      suspended: userStats?.suspended || 0,
      newThisWeek: userStats?.new_this_week || 0,
    },
    briefs: {
      ...briefStats,
      thisWeek: briefThisWeek?.n || 0,
    },
    pulses: {
      total: pulseStats?.total || 0,
      thisWeek: pulseThisWeek?.n || 0,
    },
    invites: inviteSummary,
    emails: {
      total: emailStats?.total || 0,
      sent: emailStats?.sent || 0,
      failed: emailStats?.failed || 0,
      dryRun: emailStats?.dryRun || 0,
      thisMonth: emailThisMonth?.n || 0,
    },
    audit: {
      overallScore,
      dimCount: dims.length,
      checks,
    },
  });
}
