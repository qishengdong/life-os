/**
 * GET /api/admin/unsent-callbacks
 *
 * Owner 视图 · 所有 callback 已到期但用户没回的未交付的信.
 * 用于 manual mode: owner 看 surface, 复制文案微信发 (V1 没自动 push channel).
 *
 * Auth: requireAdmin
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { listPendingCallbacks } from '@/lib/unsent/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CATEGORY_LABEL: Record<string, string> = {
  parent: '父母',
  child: '孩子',
  partner: '伴侣',
  boss: '老板/同事',
  self: '自己',
  'past-self': '十年前的自己',
};

function generateCallbackText(args: {
  recipientName: string | null;
  category: string;
  recipientLabel: string | null;
  daysOverdue: number;
}): string {
  const who = args.recipientLabel || CATEGORY_LABEL[args.category] || args.category;
  const greeting = args.recipientName ? `${args.recipientName}, ` : '';
  return `${greeting}你 7 天前写过一封想寄给"${who}"的信. 寄了吗?
回 1 = 寄了 · 回 2 = 最终没寄 · 回 3 = 还没动, 想再放放 (KEY 不催了)`;
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const pending = await listPendingCallbacks();
    const items = pending.map((p) => ({
      letterId: p.letter.id,
      userId: p.userId,
      recipientName: p.recipientName,
      wechatId: p.wechatId,
      category: p.letter.category,
      recipientLabel: p.letter.recipientLabel,
      daysOverdue: p.daysOverdue,
      contentPreview: p.letter.content.slice(0, 80), // 仅 preview, 不全文
      callbackText: generateCallbackText({
        recipientName: p.recipientName,
        category: p.letter.category,
        recipientLabel: p.letter.recipientLabel,
        daysOverdue: p.daysOverdue,
      }),
    }));
    return NextResponse.json({ items, total: items.length });
  } catch (e: any) {
    console.error('[api/admin/unsent-callbacks]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
