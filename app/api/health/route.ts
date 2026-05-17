import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDb();
    const row = (await db.prepare('SELECT COUNT(*) as n FROM users').get()) as { n: number };
    return NextResponse.json({
      ok: true,
      uptime: process.uptime(),
      userCount: row.n,
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
