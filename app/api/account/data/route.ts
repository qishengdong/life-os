/**
 * /api/account/data — 用户数据权利
 *
 * 《个人信息保护法》第四十四 / 四十五 / 四十七条:
 *   - 个人有权"查阅、复制"其个人信息 (GET 导出)
 *   - 个人有权"删除"其个人信息 (DELETE)
 *
 * GET   /api/account/data?download=1  → 返回 JSON, 所有 user 关联的表内容
 * DELETE /api/account/data            → 硬删除当前用户全部数据
 *
 * 注: 删除是不可逆的. 前端必须二次确认 (输入"删除我的全部数据"字串).
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 用户自有数据的表 + 是否需要 user_id 关联
// (按 schema 抽出, 增表时同步加)
const USER_TABLES = [
  { name: 'users', whereCol: 'id' }, // users 表用 id 不是 user_id
  { name: 'decisions', whereCol: 'user_id' },
  { name: 'user_core_state', whereCol: 'user_id' },
  { name: 'relationship_memory_cards', whereCol: 'user_id' },
  { name: 'relationship_open_loops', whereCol: 'user_id' },
  { name: 'user_brain', whereCol: 'user_id' },
  { name: 'emails_sent', whereCol: 'user_id' },
  { name: 'decision_outcomes', whereCol: 'user_id' },
  { name: 'sunday_reviews', whereCol: 'user_id' },
  { name: 'daily_pulses', whereCol: 'user_id' },
  { name: 'life_os_commitments', whereCol: 'user_id' },
  { name: 'inspector_audit', whereCol: 'user_id' },
] as const;

// ============================================================================
// GET — 导出全部数据
// ============================================================================
export async function GET(req: NextRequest) {
  try {
    const { userId } = resolveUserId(req);
    const db = getDb();
    const url = new URL(req.url);
    const download = url.searchParams.get('download') === '1';

    const exportData: Record<string, any[]> = {};
    let totalRows = 0;

    for (const t of USER_TABLES) {
      try {
        const rows = db
          .prepare(`SELECT * FROM ${t.name} WHERE ${t.whereCol} = ?`)
          .all(userId);
        exportData[t.name] = rows;
        totalRows += rows.length;
      } catch (e) {
        // 表不存在等情况 — 跳过
        exportData[t.name] = [];
      }
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      userId,
      totalRows,
      note: '本文件包含你在 KEY 上的全部个人数据. 时间戳是 Unix epoch (秒).',
      data: exportData,
    };

    if (download) {
      const filename = `life-os-data-${userId}-${Date.now()}.json`;
      return new NextResponse(JSON.stringify(payload, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json(payload);
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ============================================================================
// DELETE — 硬删除全部数据
// ============================================================================
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = resolveUserId(req);
    const body = await req.json().catch(() => ({}));

    // 二次确认 — 必须传 confirm: "删除我的全部数据"
    if (body?.confirm !== '删除我的全部数据') {
      return NextResponse.json(
        { error: '需要二次确认: 请在请求 body 传 {"confirm":"删除我的全部数据"}' },
        { status: 400 }
      );
    }

    const db = getDb();
    const summary: Record<string, number> = {};
    let totalDeleted = 0;

    // 用一个事务删除, 任一表失败全部回滚
    const tx = db.transaction(() => {
      // 删 users 表放最后 (避免外键级联问题)
      const nonUserTables = USER_TABLES.filter((t) => t.name !== 'users');
      for (const t of nonUserTables) {
        try {
          const res = db.prepare(`DELETE FROM ${t.name} WHERE ${t.whereCol} = ?`).run(userId);
          summary[t.name] = res.changes;
          totalDeleted += res.changes;
        } catch (e) {
          summary[t.name] = -1; // 表不存在
        }
      }
      // 最后删 users
      const userRes = db.prepare(`DELETE FROM users WHERE id = ?`).run(userId);
      summary['users'] = userRes.changes;
      totalDeleted += userRes.changes;
    });

    tx();

    return NextResponse.json({
      success: true,
      userId,
      totalRowsDeleted: totalDeleted,
      perTable: summary,
      note: '你的全部数据已永久删除. 重新使用产品将创建新的匿名身份.',
    });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
