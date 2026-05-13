/**
 * AI 生成内容标识 — 合规要求.
 *
 * 《生成式人工智能服务管理暂行办法》第十二条:
 *   "提供者应当按照《互联网信息服务深度合成管理规定》对图片、视频等
 *    生成内容进行标识."
 *
 * 即使是文本, 行业惯例也是显式标识. KEY 长输出 (Brain 整合 /
 * Decision Deep Dive / Sunday Review) 都加.
 *
 * 短输出 (Pulse 30-80 字回应) 在 UI 层面已经天然区分 (头像 / 卡片背景),
 * 不再每条都加, 避免噪音.
 */

export const AI_GENERATED_NOTICE_INLINE = '\n\n— 以上内容由 AI 生成, 仅供参考, 不构成医疗 / 法律 / 财务建议.';

export const AI_GENERATED_NOTICE_FOOTER = `

---
*以上内容由 AI 生成, 仅作为决策辅助参考, 不构成医疗、法律或财务建议.
重大决定请结合专业意见.*`;

/**
 * 给长输出文本拼上 AI 生成标识 footer.
 * 已含 footer 的不重复加 (检测 "AI 生成").
 */
export function appendAIDisclosure(text: string, style: 'inline' | 'footer' = 'footer'): string {
  if (text.includes('AI 生成') || text.includes('AI生成')) {
    return text;
  }
  return text + (style === 'inline' ? AI_GENERATED_NOTICE_INLINE : AI_GENERATED_NOTICE_FOOTER);
}
