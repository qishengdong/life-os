/**
 * /api/decision-asset · 5/22 ship · P2.4
 *
 * GET · 返回用户 4 维成长可见度 (Layer 1-4)
 *
 * 灵魂铁律:
 *   - 全部 100% 来自用户真档案 (anti-hallucination)
 *   - KEY 不评判, 不解读, 不下结论
 *   - 没有 streak / badge / 排名 (不 gamification)
 *   - 没有数据 → 老实说"还没累积, 继续写"
 *
 * 4 维数据 source:
 *   L1 (Fact): daily_pulses + decision_briefs + decision_outcomes 计数 + account_age
 *   L2 (Pattern): pulses 的 tags 出现频次, 找 ≥ 3 次的 (真重复才算)
 *   L3 (Prediction): decision_outcomes 已回答的数量 + 跨度
 *   L4 (Metacognition): morning_mirror_log + weekly_pattern_log user_action='respond' 数量
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { getDb } from '@/lib/db';
import { getUserPulses, getUserPulseCount } from '@/lib/pulse/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RecurringTag {
  tag: string;
  count: number;
  firstSeenAt: number;
  lastSeenAt: number;
}

interface AssetData {
  // Layer 1 · 事实量
  layer1: {
    totalPulses: number;
    totalBriefs: number;
    totalOutcomesAnswered: number;
    accountAgeDays: number;
    firstPulseAt: number | null;
  };
  // Layer 2 · 模式深度
  layer2: {
    recurringPatterns: RecurringTag[];
    distinctTagsCount: number;
  };
  // Layer 3 · 预测准确度 (v1 仅展示真完成的复盘)
  layer3: {
    completedReviews: number;
    pendingReviews: number;
    earliestPredictionAt: number | null;
  };
  // Layer 4 · 元认知成熟度
  layer4: {
    mirrorsResponded: number;
    patternsResponded: number;
    totalEngagement: number;
  };
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await resolveUserId(req);
    const db = await getDb();

    // ===== Layer 1 · 事实量 =====
    const totalPulses = await getUserPulseCount(userId);

    const briefRow = (await db
      .prepare(`SELECT COUNT(*) as n FROM decision_briefs WHERE user_id = ?`)
      .get(userId)) as { n: number };
    const totalBriefs = briefRow.n;

    // outcomes: 已回答的回访 (status = 'answered')
    let totalOutcomesAnswered = 0;
    let pendingReviews = 0;
    let earliestPredictionAt: number | null = null;
    try {
      const outcomesAns = (await db
        .prepare(`SELECT COUNT(*) as n FROM decision_outcomes WHERE user_id = ? AND status = 'answered'`)
        .get(userId)) as { n: number };
      totalOutcomesAnswered = outcomesAns.n;

      const outcomesPending = (await db
        .prepare(`SELECT COUNT(*) as n FROM decision_outcomes WHERE user_id = ? AND status = 'pending' AND due_at <= ?`)
        .get(userId, Math.floor(Date.now() / 1000))) as { n: number };
      pendingReviews = outcomesPending.n;

      const earliest = (await db
        .prepare(`SELECT MIN(due_at) as t FROM decision_outcomes WHERE user_id = ?`)
        .get(userId)) as { t: number | null };
      earliestPredictionAt = earliest?.t ?? null;
    } catch {
      // decision_outcomes 表存在但 schema 可能微差, 静默
    }

    // 账号年龄 (第 1 条 pulse 时间)
    const firstPulse = (await db
      .prepare(`SELECT MIN(created_at) as t FROM daily_pulses WHERE user_id = ?`)
      .get(userId)) as { t: number | null };
    const firstPulseAt = firstPulse?.t ?? null;
    const accountAgeDays = firstPulseAt
      ? Math.floor((Date.now() / 1000 - firstPulseAt) / 86400)
      : 0;

    // ===== Layer 2 · 模式深度 =====
    // 拉所有 pulse 的 tags, 计频次, 找 ≥ 3 次的
    const allPulses = await getUserPulses(userId, 500);
    const tagCounts = new Map<string, { count: number; first: number; last: number }>();
    for (const p of allPulses) {
      for (const tag of p.tags || []) {
        const existing = tagCounts.get(tag);
        if (existing) {
          existing.count += 1;
          existing.first = Math.min(existing.first, p.createdAt);
          existing.last = Math.max(existing.last, p.createdAt);
        } else {
          tagCounts.set(tag, { count: 1, first: p.createdAt, last: p.createdAt });
        }
      }
    }
    const recurringPatterns: RecurringTag[] = Array.from(tagCounts.entries())
      .filter(([, v]) => v.count >= 3)
      .map(([tag, v]) => ({ tag, count: v.count, firstSeenAt: v.first, lastSeenAt: v.last }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // top 8 reduce noise
    const distinctTagsCount = tagCounts.size;

    // ===== Layer 4 · 元认知成熟度 =====
    let mirrorsResponded = 0;
    let patternsResponded = 0;
    try {
      const mirrors = (await db
        .prepare(`SELECT COUNT(*) as n FROM morning_mirror_log WHERE user_id = ? AND user_action = 'respond'`)
        .get(userId)) as { n: number };
      mirrorsResponded = mirrors.n;
    } catch {}
    try {
      const patterns = (await db
        .prepare(`SELECT COUNT(*) as n FROM weekly_pattern_log WHERE user_id = ? AND user_action = 'respond'`)
        .get(userId)) as { n: number };
      patternsResponded = patterns.n;
    } catch {}
    const totalEngagement = mirrorsResponded + patternsResponded;

    const data: AssetData = {
      layer1: {
        totalPulses,
        totalBriefs,
        totalOutcomesAnswered,
        accountAgeDays,
        firstPulseAt,
      },
      layer2: {
        recurringPatterns,
        distinctTagsCount,
      },
      layer3: {
        completedReviews: totalOutcomesAnswered,
        pendingReviews,
        earliestPredictionAt,
      },
      layer4: {
        mirrorsResponded,
        patternsResponded,
        totalEngagement,
      },
    };

    return NextResponse.json({ asset: data });
  } catch (e) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: 'invalid uid' }, { status: 401 });
    }
    console.error('[api/decision-asset GET] error:', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
