/**
 * POST /api/decision/brief — 生成一份 publication-grade 决策简报
 *
 * 跟老的 /api/decision (流式 markdown 输出) 并存. 老接口保留给现有 UI,
 * 新接口走 Analyst → Editor 两 pass 管线, 产出结构化 Brief.
 *
 * 因为两 pass 端到端 25-45 秒, 这个接口不流式. 前端展示进度条 +
 * "Analyst drafting... → Editor reviewing..." 文案让等待变成产品体验.
 *
 * 副作用:
 *   - 写入 decision_briefs 表
 *   - 写入 decisions 表 (双写, 保持跟现有 Outcome / Inspector 链路兼容)
 *   - schedule outcomes (30/90/365)
 *   - 跑 inspector + replika filter (后台)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { generateBrief } from '@/lib/decision/brief-pipeline';
import { renderBriefMarkdown } from '@/lib/decision/brief-schema';
import { writeC16Audit } from '@/lib/decision/contradiction-detector';
import { saveBrief, saveDecision, updateUserProfile } from '@/lib/db';
import { scheduleOutcomes } from '@/lib/outcomes/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // brief pipeline 最长 60 秒

const RequestSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '生日格式应为 YYYY-MM-DD'),
  gender: z.enum(['female', 'male', 'other']),
  decision: z.string().min(20, '决策描述太短了, 多写一点背景和卡点').max(2000),
  skipEditor: z.boolean().optional(),
  displayName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let userId: number;
  try {
    ({ userId } = resolveUserId(req));
  } catch (e) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json(
        { error: '缺少有效的用户身份 (X-User-UID header). 请刷新页面.' },
        { status: 400 }
      );
    }
    throw e;
  }

  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || '输入格式错误' },
        { status: 400 }
      );
    }

    const input = parsed.data;
    updateUserProfile(userId, { birthDate: input.birthDate, gender: input.gender });

    // 跑 pipeline
    const result = await generateBrief({
      userId,
      birthDate: input.birthDate,
      gender: input.gender,
      decision: input.decision,
      skipEditor: input.skipEditor,
      displayName: input.displayName,
    });

    // Safety short-circuit (crisis / blocklist)
    if (result.safetyShortCircuit) {
      return NextResponse.json({
        shortCircuit: true,
        trigger: result.safetyShortCircuit.trigger,
        response: result.safetyShortCircuit.response,
      });
    }

    if (!result.success || !result.brief) {
      return NextResponse.json(
        { error: result.error || '简报生成失败' },
        { status: 500 }
      );
    }

    const brief = result.brief;
    const renderedMarkdown = renderBriefMarkdown(brief);

    // 双写: 老 decisions 表 (保持 Outcome / Inspector / 历史页兼容)
    const decisionId = saveDecision({
      userId,
      question: input.decision,
      aiResponse: renderedMarkdown, // 渲染好的 markdown 给历史页用
      modelUsed: `deepseek/brief-pipeline`,
      framework: brief.meta.framework,
      tokensInput: 0,
      tokensOutput: brief.meta.tokensUsed,
    });

    // 新表: decision_briefs (结构化)
    const briefRowId = saveBrief({
      userId,
      decisionId,
      briefJson: JSON.stringify(brief),
      briefNumber: brief.briefNumber,
      topic: brief.topic,
      framework: brief.meta.framework,
      renderedMarkdown,
      totalCharCount: brief.meta.totalCharCount,
      editorPassUsed: brief.meta.editorPassUsed,
      tokensUsed: brief.meta.tokensUsed,
      durationAnalystMs: brief.meta.durationMs.analyst,
      durationEditorMs: brief.meta.durationMs.editor,
    });

    // 排 outcome checkpoints (30/90/365)
    try {
      scheduleOutcomes(decisionId, userId);
    } catch (e) {
      console.error('[decision/brief] scheduleOutcomes failed:', e);
    }

    // C16 audit (写入 inspector_audit, 跟其他 C* check 一起入表)
    if (result.contradictions && result.contradictions.length > 0) {
      try {
        writeC16Audit({ userId, decisionId, contradictions: result.contradictions });
      } catch (e) {
        console.error('[decision/brief] writeC16Audit failed:', e);
      }
    }

    return NextResponse.json({
      success: true,
      briefRowId,
      briefNumber: brief.briefNumber,
      brief, // 完整结构化 brief
      renderedMarkdown,
      validationIssues: result.validationIssues,
      contradictions: result.contradictions, // C16 检测结果 (供 UI debug)
      timings: result.timings,
      meta: {
        editorPassUsed: brief.meta.editorPassUsed,
        totalCharCount: brief.meta.totalCharCount,
        framework: brief.meta.framework,
        contradictionsFound: (result.contradictions?.length || 0),
      },
    });
  } catch (e: any) {
    console.error('[API /decision/brief POST] Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
