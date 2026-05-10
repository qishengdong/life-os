import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const decisions = db
      .prepare(
        `SELECT
           d.id,
           d.user_id,
           d.question,
           d.ai_response,
           d.model_used,
           d.tokens_input,
           d.tokens_output,
           d.created_at,
           u.birth_date,
           u.gender
         FROM decisions d
         LEFT JOIN users u ON u.id = d.user_id
         ORDER BY d.created_at DESC
         LIMIT 100`
      )
      .all();

    return NextResponse.json({ decisions });
  } catch (error: any) {
    console.error('[API /history] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
