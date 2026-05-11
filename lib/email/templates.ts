/**
 * Email Templates — 严肃出版物风格 (跟 Web UI 一致)
 *
 * 设计原则:
 *   - Plain text 主导, HTML 简洁
 *   - 不带 emoji
 *   - 不带 marketing 话术
 *   - 高级品牌句作为 footer
 *   - 退订链接 in footer (V1.5)
 */

const BRAND_FOOTER_HTML = `
<div style="margin-top:48px;padding-top:24px;border-top:1px solid #E8DFD0;font-family:'Source Han Serif',Lora,serif;font-size:13px;color:#9D9081;line-height:1.6;">
  <p style="margin:0 0 6px 0;font-style:italic;color:#3A2E26;">陪你想清楚 · 看清代价 · 长期记得你</p>
  <p style="margin:0;">Life OS · 一份关于人生重大决策的长期陪伴</p>
  <p style="margin:6px 0 0 0;font-size:11px;color:#9D9081;">不想再收到这类邮件? <a href="{unsubscribe_url}" style="color:#9B2D27;text-decoration:none;">取消订阅</a></p>
</div>
`;

const BRAND_FOOTER_TEXT = `
---
陪你想清楚 · 看清代价 · 长期记得你
Life OS — 一份关于人生重大决策的长期陪伴

不想再收到这类邮件? {unsubscribe_url}
`;

function htmlShell(innerHtml: string, unsubscribeUrl: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Life OS</title>
</head>
<body style="margin:0;padding:0;background:#FAF7F2;">
  <div style="max-width:620px;margin:0 auto;padding:40px 28px;font-family:'Source Han Serif',Lora,'PingFang SC',serif;color:#3A2E26;line-height:1.7;font-size:16px;">
    ${innerHtml}
    ${BRAND_FOOTER_HTML.replace('{unsubscribe_url}', unsubscribeUrl)}
  </div>
</body>
</html>`;
}

function textShell(inner: string, unsubscribeUrl: string): string {
  return `${inner}\n\n${BRAND_FOOTER_TEXT.replace('{unsubscribe_url}', unsubscribeUrl)}`;
}

// ============================================================================
// Template: Welcome (Onboarding 后第一封)
// ============================================================================
export interface WelcomeArgs {
  userName?: string;
  brainSnippet?: string;
  appUrl: string;
  unsubscribeUrl: string;
}

export function buildWelcomeEmail(args: WelcomeArgs) {
  const subject = '你好 — 它已经开始记得你了';
  const greeting = args.userName ? `${args.userName},` : '你好,';
  const brainPart = args.brainSnippet
    ? `\n它从你刚才的访谈里整理了关于你的初版备忘录, 摘一段给你看:\n\n${args.brainSnippet}\n\n这只是开始. 你每天写的 Pulse 都会让它对你的认识更准.`
    : '';

  const text = `${greeting}

欢迎来到 Life OS — 一份关于人生重大决策的长期陪伴.

我不是 ChatGPT. 我不会每次都问你"你是谁". 我也不会替你做决定.
我会在你写下今天的 Pulse 时, 看见那个你没说出口的张力.
我会在你做完重大决策 30 天后回来问"当时担心的事现在怎么样了".
我会在你卡了几周的事上, 陪你一步步把它想清楚.${brainPart}

现在去写今天的第一条 Pulse:
${args.appUrl}

你的数据只在你的服务器上. 永不上传第三方. 永不卖. 永不训练模型.`;

  const html = htmlShell(`
    <p style="margin:0 0 24px 0;font-size:14px;color:#9B2D27;text-transform:uppercase;letter-spacing:0.2em;">· Welcome ·</p>
    <h1 style="font-size:32px;line-height:1.2;font-weight:700;letter-spacing:-0.02em;margin:0 0 24px 0;">${greeting}<br/>它已经开始记得你了.</h1>
    <p style="margin:0 0 16px 0;">欢迎来到 Life OS — 一份关于人生重大决策的长期陪伴.</p>
    <p style="margin:0 0 16px 0;">我不是 ChatGPT. 我不会每次都问你"你是谁". 我也不会替你做决定.</p>
    <p style="margin:0 0 16px 0;">我会在你写下今天的 Pulse 时, 看见那个你没说出口的张力. 我会在你做完重大决策 30 天后回来问"当时担心的事现在怎么样了". 我会在你卡了几周的事上, 陪你一步步把它想清楚.</p>
    ${args.brainSnippet ? `
      <div style="margin:32px 0;padding:20px 24px;background:#F4EFE5;border-left:4px solid #9B2D27;">
        <p style="margin:0 0 8px 0;font-size:12px;color:#9B2D27;text-transform:uppercase;letter-spacing:0.15em;">· 它对你的初版备忘录 ·</p>
        <p style="margin:0;color:#3A2E26;">${args.brainSnippet}</p>
      </div>
    ` : ''}
    <p style="margin:32px 0 16px 0;">现在去写今天的第一条 Pulse:</p>
    <a href="${args.appUrl}" style="display:inline-block;padding:14px 28px;background:#9B2D27;color:#FAF7F2;text-decoration:none;font-weight:500;">打开 Life OS →</a>
    <p style="margin:32px 0 0 0;font-size:13px;color:#9D9081;">你的数据只在你的服务器上. 永不上传第三方. 永不卖. 永不训练模型.</p>
  `, args.unsubscribeUrl);

  return {
    subject,
    text: textShell(text, args.unsubscribeUrl),
    html,
  };
}

// ============================================================================
// Template: Sunday Review 推送
// ============================================================================
export interface SundayReviewArgs {
  userName?: string;
  weekRangeLabel: string;        // "05/12 → 05/18"
  reviewSnippet: string;          // 节选 first 节 ~300 字
  reviewUrl: string;              // 跳完整 review URL
  pulseCount: number;
  unsubscribeUrl: string;
}

export function buildSundayReviewEmail(args: SundayReviewArgs) {
  const subject = `这周 AI 看见了什么 (${args.weekRangeLabel})`;
  const greeting = args.userName ? `${args.userName},` : '你好,';

  const text = `${greeting}

这周你写了 ${args.pulseCount} 条 Pulse. AI 把它们放在一起看, 找你反复提到的事、你没说出口的张力、下周值得观察的信号.

节选第一节:

${args.reviewSnippet}

完整 Review 请点开看:
${args.reviewUrl}

3 节读完 5 分钟. 周日下午一杯茶的时间.`;

  const html = htmlShell(`
    <p style="margin:0 0 24px 0;font-size:14px;color:#9B2D27;text-transform:uppercase;letter-spacing:0.2em;">· Weekly Review · ${args.weekRangeLabel} ·</p>
    <h1 style="font-size:30px;line-height:1.2;font-weight:700;letter-spacing:-0.02em;margin:0 0 16px 0;">这周 AI 看见了什么</h1>
    <p style="margin:0 0 32px 0;font-size:14px;color:#6B5D52;">${greeting} 这周你写了 ${args.pulseCount} 条 Pulse. AI 把它们放在一起看, 找你反复提到的事、你没说出口的张力、下周值得观察的信号.</p>
    <div style="margin:0 0 32px 0;padding:24px 28px;background:#F4EFE5;border-left:4px solid #9B2D27;">
      <p style="margin:0 0 12px 0;font-size:12px;color:#9B2D27;text-transform:uppercase;letter-spacing:0.15em;">· 节选 ·</p>
      <p style="margin:0;color:#3A2E26;white-space:pre-wrap;">${args.reviewSnippet}</p>
    </div>
    <a href="${args.reviewUrl}" style="display:inline-block;padding:14px 28px;background:#9B2D27;color:#FAF7F2;text-decoration:none;font-weight:500;">读完整 Review →</a>
    <p style="margin:24px 0 0 0;font-size:13px;color:#9D9081;">3 节读完 5 分钟. 周日下午一杯茶的时间.</p>
  `, args.unsubscribeUrl);

  return {
    subject,
    text: textShell(text, args.unsubscribeUrl),
    html,
  };
}

// ============================================================================
// Template: Outcome Due (30 / 90 / 365 day 到期)
// ============================================================================
export interface OutcomeDueArgs {
  userName?: string;
  checkpointDays: number;
  decisionDateLabel: string;     // "4 月 11 日"
  decisionQuestion: string;       // 截断到 ~100 字
  outcomesUrl: string;
  unsubscribeUrl: string;
}

export function buildOutcomeDueEmail(args: OutcomeDueArgs) {
  const subject = `${args.checkpointDays} 天前你决定的那件事 — 现在怎么样了?`;
  const greeting = args.userName ? `${args.userName},` : '你好,';

  const text = `${greeting}

${args.checkpointDays} 天前 (${args.decisionDateLabel}), 你跟我聊过这件事:

"${args.decisionQuestion}"

那时候我们把它拆开了, 列了 3 条路径, 做了 PreMortem.
现在它发生得怎么样了?

我不是来追问的. 是来跟你一起看 — 你当时担心的事到底命中了几个, 当时没想到的是什么, 哪些假设错了, 哪些对了.

100-500 字, 不需要工整. 越具体越准.

去回答:
${args.outcomesUrl}

这次复盘会进入你的决策账本. 12 个月后你会看见你做决定的 pattern.`;

  const html = htmlShell(`
    <p style="margin:0 0 24px 0;font-size:14px;color:#9B2D27;text-transform:uppercase;letter-spacing:0.2em;">· Outcome Check · ${args.checkpointDays} day ·</p>
    <h1 style="font-size:30px;line-height:1.25;font-weight:700;letter-spacing:-0.02em;margin:0 0 16px 0;">${args.checkpointDays} 天前你决定的那件事 — 现在怎么样了?</h1>
    <p style="margin:0 0 24px 0;font-size:14px;color:#6B5D52;">${greeting} ${args.checkpointDays} 天前 (${args.decisionDateLabel}), 你跟我聊过这件事.</p>
    <blockquote style="margin:0 0 24px 0;padding:16px 24px;border-left:4px solid #9B2D27;background:#F4EFE5;font-style:italic;color:#3A2E26;">${args.decisionQuestion}</blockquote>
    <p style="margin:0 0 16px 0;">那时候我们把它拆开了, 列了 3 条路径, 做了 PreMortem. <strong>现在它发生得怎么样了?</strong></p>
    <p style="margin:0 0 24px 0;">我不是来追问的. 是来跟你一起看 — 你当时担心的事到底命中了几个, 当时没想到的是什么, 哪些假设错了, 哪些对了.</p>
    <p style="margin:0 0 24px 0;">100-500 字, 不需要工整. 越具体越准.</p>
    <a href="${args.outcomesUrl}" style="display:inline-block;padding:14px 28px;background:#9B2D27;color:#FAF7F2;text-decoration:none;font-weight:500;">告诉 AI 现在怎么样了 →</a>
    <p style="margin:24px 0 0 0;font-size:13px;color:#9D9081;">这次复盘会进入你的决策账本. 12 个月后你会看见你做决定的 pattern.</p>
  `, args.unsubscribeUrl);

  return {
    subject,
    text: textShell(text, args.unsubscribeUrl),
    html,
  };
}

// ============================================================================
// Template: Commitment Reminder (AI 自己许诺的事到期)
// ============================================================================
export interface CommitmentArgs {
  userName?: string;
  commitmentText: string;
  daysAgo: number;
  appUrl: string;
  unsubscribeUrl: string;
}

export function buildCommitmentEmail(args: CommitmentArgs) {
  const subject = `${args.daysAgo} 天前你跟我说要 — 进展如何?`;
  const greeting = args.userName ? `${args.userName},` : '你好,';

  const text = `${greeting}

${args.daysAgo} 天前你跟我说了这件事:

"${args.commitmentText}"

它办了吗?

不是检查你. 是想知道你当时说这话的那个状态, 跟现在比, 有没有什么变化.

如果办了, 简单说一句; 没办, 也简单说一句 — 都比假装它没说过更有用.

打开:
${args.appUrl}`;

  const html = htmlShell(`
    <p style="margin:0 0 24px 0;font-size:14px;color:#9B2D27;text-transform:uppercase;letter-spacing:0.2em;">· Follow-up · ${args.daysAgo} days ago ·</p>
    <h1 style="font-size:28px;line-height:1.25;font-weight:700;letter-spacing:-0.02em;margin:0 0 24px 0;">你跟我说要做的事 — 进展如何?</h1>
    <p style="margin:0 0 24px 0;">${greeting} ${args.daysAgo} 天前你跟我说了这件事:</p>
    <blockquote style="margin:0 0 24px 0;padding:16px 24px;border-left:4px solid #9B2D27;background:#F4EFE5;font-style:italic;color:#3A2E26;">${args.commitmentText}</blockquote>
    <p style="margin:0 0 16px 0;">不是检查你. 是想知道你当时说这话的那个状态, 跟现在比, 有没有什么变化.</p>
    <p style="margin:0 0 24px 0;">如果办了, 简单说一句; 没办, 也简单说一句 — 都比假装它没说过更有用.</p>
    <a href="${args.appUrl}" style="display:inline-block;padding:14px 28px;background:#9B2D27;color:#FAF7F2;text-decoration:none;font-weight:500;">打开 Life OS →</a>
  `, args.unsubscribeUrl);

  return {
    subject,
    text: textShell(text, args.unsubscribeUrl),
    html,
  };
}
