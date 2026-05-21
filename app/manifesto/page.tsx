/**
 * /manifesto — 创始人宣言 · 5/21 重写 v2
 *
 * 战略修正:
 *   - 旧 hero "我做 KEY 是因为我自己需要它" 没 commercial 张力
 *   - 新 hero "我做 KEY, 是因为我自己怕做错一个回不来的决定"
 *   - 删 "5 不做" 里 "永不上中国 App Store" (太激进, 改"不接审查")
 *   - 加 "No advice without evidence" 作为铁律
 *   - 嵌真用户决策场景 (父母失智 / 配偶冲突 / 孩子留学窗口)
 *
 * 6 段:
 *   1. Hook · 我的回不来决定 (具体, 不是抽象"我后悔过")
 *   2. 诊断 · 35-45 岁中国家庭决策者 4 盲区
 *   3. 反思 · ChatGPT / 日记 / 教练 / 咨询为什么救不了
 *   4. 定义 · KEY 是什么 (Signal→Risk→Brief→Action→Review)
 *   5. 承诺 · 5 不做 + 3 会做
 *   6. 签名
 */
'use client';

import Link from 'next/link';
import KeyWordmark from '@/components/KeyWordmark';

export default function ManifestoPage() {
  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <nav className="max-w-prose-xl mx-auto px-6 pt-10 pb-6 flex justify-between items-baseline">
        <Link href="/" aria-label="KEY home" className="block">
          <KeyWordmark variant="nav" height={22} />
        </Link>
        <div className="flex gap-6 text-[11px] font-sans uppercase tracking-[0.2em] text-ink-500">
          <Link href="/why-key" className="hover:text-seal-500 transition-colors">为什么 KEY</Link>
          <Link href="/how-it-works" className="hover:text-seal-500 transition-colors">如何工作</Link>
          <Link href="/invite" className="hover:text-seal-500 transition-colors">加入</Link>
        </div>
      </nav>

      <main className="max-w-prose-md mx-auto px-6 pb-24">
        <header className="pt-16 pb-12 text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
            · 创始人 · 写给一个我还没找到的人 ·
          </p>
          <h1 className="font-serif text-editorial-xl text-ink-900 tracking-tighter leading-[1.1] mb-8">
            我做 KEY,<br />
            是因为我自己<br />
            怕做错一个<br />
            回不来的决定.
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
            2026 · 春 · 北京
          </p>
        </header>

        {/* ====================================================== */}
        {/* 1. Hook · 个人真话 · 一个回不来的决定                    */}
        {/* ====================================================== */}
        <section className="mb-16">
          <p className="font-serif text-reading text-ink-700 editorial-leading mb-5">
            2023 年, 我做过一个让我至今心里没数的决定. 不是巨大的灾难性事故, 是那种**5 年后才会显形**的事 — 当时所有数据都支持那个选择, 但今天我已经记不清当时**自己怕的到底是什么**.
          </p>
          <p className="font-serif text-reading text-ink-700 editorial-leading mb-5">
            那一刻我想明白一件事: 35-45 岁这个阶段, 我们做的不是小决定. 父母开始失智, 孩子卡在国际线最后窗口, 跟伴侣的工作冲突一年了没真聊过,
            partner-track 升不上又跳不出去 — <strong>每一个都 5-10 年后才显形, 都没有"赔付"机制, 都回不来</strong>.
          </p>
          <p className="font-serif italic text-reading text-ink-500 editorial-leading">
            而我们手里, 没有一个工具是为这种决定设计的.
          </p>
        </section>

        {/* ====================================================== */}
        {/* 2. 诊断 · 35-45 岁中国家庭决策者的 4 盲区                */}
        {/* ====================================================== */}
        <section className="mb-16 border-t border-paper-300 pt-12">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · I. 我看到的事 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-8">
            决定不是越来越难, 是越来越**回不来**.
          </h2>
          <div className="space-y-5 font-serif text-reading text-ink-700 editorial-leading">
            <p>
              35-45 岁中国人决策密度比 10 年前高 3 倍. 但决定本身没变难 — 信息够, 路径清晰. 真正变了的是**代价的可逆性**.
              30 岁选错可以重来, 40 岁选错很多事就锁死了.
            </p>
            <p>
              这种局面下, 人天然有 4 个盲区 — **低估不可逆代价, 高估自己承受力, 把恐惧/愧疚/愤怒包装成"理性分析", 忽略反复出现的历史模式**.
              这不是智力问题, 是人脑结构问题. 越是高知决策者, 越擅长把这 4 件事包装成"我考虑清楚了".
            </p>
            <p className="font-serif italic text-ink-500">
              我看到我自己在每一个盲区里都栽过. 我朋友圈里那些最聪明的人也是.
            </p>
          </div>
        </section>

        {/* ====================================================== */}
        {/* 3. 反思 · ChatGPT / 日记 / 教练为什么救不了              */}
        {/* ====================================================== */}
        <section className="mb-16 border-t border-paper-300 pt-12">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · II. 为什么现有工具救不了 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-8">
            它们都在做**别的事**.
          </h2>
          <div className="space-y-6 font-serif text-reading text-ink-700 editorial-leading">
            <div>
              <p className="font-serif italic text-seal-500 mb-1">— ChatGPT —</p>
              <p>给"最佳实践", 但每次开新对话不认识你. 是个**博学但失忆**的顾问. 你跟它说"我父亲失智了我嫂子在国外", 它给你一份通用应对方案 — 没你的真实背景.</p>
            </div>
            <div>
              <p className="font-serif italic text-seal-500 mb-1">— 日记 / Day One / Notion —</p>
              <p>被动归档. 你 3 个月后翻不到关键那条. 它们是档案柜, 不是**作证人**. 大决定那天, 你根本不会主动翻日记.</p>
            </div>
            <div>
              <p className="font-serif italic text-seal-500 mb-1">— 教练 / 咨询师 —</p>
              <p>给你方法论 / 解读, 但每次都是新的对话, 没有跨年连续记忆. 一年 12 次咨询, 12 次重新开始解释你是谁.</p>
            </div>
            <div>
              <p className="font-serif italic text-seal-500 mb-1">— 咨询公司 (麦肯锡 / 私董会) —</p>
              <p>给你**别人的轨迹** (行业最佳实践). 单次 ¥3-50 万, 但留下的是 deck, 不是你. 你这一生不会让一家咨询公司管 30 年的决定档案.</p>
            </div>
            <p className="pt-5 border-t border-paper-300">
              真问题不是"AI 不够聪明", 是<strong>没有一种工具, 在你做大决定时, 把你 30 天前真说过的话端给你</strong>.
              这种工具 LLM 之前根本做不出 — 没有长期个人记忆, 没有主动调用, 没有 anti-hallucination. 现在 3 个条件第一次同时成立.
            </p>
          </div>
        </section>

        {/* ====================================================== */}
        {/* 4. 定义 · KEY 是什么 (5-step loop)                       */}
        {/* ====================================================== */}
        <section className="mb-16 border-t border-paper-300 pt-12">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · III. KEY 是什么 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-8">
            重大决定前的私人风险审查.
          </h2>
          <div className="space-y-5 font-serif text-reading text-ink-700 editorial-leading">
            <p>
              KEY 是一项 AI 原生服务. 每天 30 秒收一个真信号; 信号反复出现, 标记到 6 类风险域 (关系/事业/父母/身体/资产/自我); 大决定来临, 把这些真档案整理成一份**私人决策风险简报** (10 维必答).
            </p>
            <p>
              简报最后<strong>不给大结论, 给最小验证动作</strong> — 接父母前先住一周试运行, 跳槽前先看 6 个月日历, 不真跳. 让大决定的信息密度升 3 倍, 不可逆风险下降一档.
            </p>
            <p>
              30 / 90 / 365 天后, KEY <strong>主动回来问你</strong>: 当时担心的事真发生了吗? 你押的判断对了几成?
              一年后, 你手里有一本**自己的判断力档案** — 你哪些预测靠谱 · 哪些反复看错 · 哪种决定盲点在哪.
            </p>
            <p className="pt-5 border-l-2 border-seal-500 pl-5 italic text-ink-700 bg-paper-50 py-3">
              这是 AI 原生的真差异化, 不是模型大小, 是<strong>长期个性化记忆 + 主动调用 + 忠实引用</strong>. 三件事 LLM 之前根本做不到.
            </p>
          </div>
        </section>

        {/* ====================================================== */}
        {/* 5. 承诺 · 5 不做 + 3 会做                                */}
        {/* ====================================================== */}
        <section className="mb-16 border-t border-paper-300 pt-12">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · IV. 我的承诺 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-10">
            KEY 永远不会做的 5 件事.
          </h2>
          <ul className="space-y-4 font-serif text-reading text-ink-700 editorial-leading mb-12">
            <li className="flex items-baseline gap-4">
              <span className="font-mono text-[11px] text-ember w-6 shrink-0">01</span>
              <span><strong className="text-ink-900">永远不卖广告</strong>. 你付钱, 不是被卖.</span>
            </li>
            <li className="flex items-baseline gap-4">
              <span className="font-mono text-[11px] text-ember w-6 shrink-0">02</span>
              <span><strong className="text-ink-900">你的真话永远不进训练数据</strong>. 档案在境外节点, 你可一键导出 / 删除 / 继承.</span>
            </li>
            <li className="flex items-baseline gap-4">
              <span className="font-mono text-[11px] text-ember w-6 shrink-0">03</span>
              <span><strong className="text-ink-900">永远不打分, 永远不出示, 永远不审判</strong>. 你的决策档案永远是你的 — KEY 不会让保险公司 / 婚恋平台 / HR 拿去评估你.</span>
            </li>
            <li className="flex items-baseline gap-4">
              <span className="font-mono text-[11px] text-ember w-6 shrink-0">04</span>
              <span><strong className="text-ink-900">永远不主动给建议</strong>. KEY 只把你说过的话还给你, 决定永远是你做的. <em>No advice without evidence.</em></span>
            </li>
            <li className="flex items-baseline gap-4">
              <span className="font-mono text-[11px] text-ember w-6 shrink-0">05</span>
              <span><strong className="text-ink-900">永远不做"决策思维"内容订阅</strong>. 不是樊登, 不是得到. 你来 KEY 是看见自己, 不是学新东西.</span>
            </li>
          </ul>

          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-10">
            KEY 永远会做的 3 件事.
          </h2>
          <ul className="space-y-4 font-serif text-reading text-ink-700 editorial-leading">
            <li className="flex items-baseline gap-4">
              <span className="font-mono text-[11px] text-seal-500 w-6 shrink-0">01</span>
              <span><strong className="text-ink-900">忠实引用你说过的话</strong>. Anti-hallucination 是产品底线. 编一处, 我们公开承认 + 修.</span>
            </li>
            <li className="flex items-baseline gap-4">
              <span className="font-mono text-[11px] text-seal-500 w-6 shrink-0">02</span>
              <span><strong className="text-ink-900">主动回访你的预测</strong>. 30 / 90 / 365 天, KEY 自己回来问 — 把你的真话端给你, 不是发邮件让你"回来用".</span>
            </li>
            <li className="flex items-baseline gap-4">
              <span className="font-mono text-[11px] text-seal-500 w-6 shrink-0">03</span>
              <span><strong className="text-ink-900">慢</strong>. 30 秒一句, 90 天后再看. 灵魂指标是 30 天回访率, 不是 DAU. 这是反加速主义的产品姿态.</span>
            </li>
          </ul>
        </section>

        {/* ====================================================== */}
        {/* 6. 签名 + CTA                                            */}
        {/* ====================================================== */}
        <section className="mb-12 border-t border-paper-300 pt-12">
          <p className="font-serif text-reading text-ink-700 editorial-leading mb-5">
            如果你看到这里, 你大概是我要找的人. 你做过几个回不来的决定, 你知道我说的是什么.
          </p>
          <p className="font-serif text-reading text-ink-700 editorial-leading mb-5">
            KEY 内测中, 前 100 名认真选. 我们不靠投资人催进度, 不靠 PR 涨用户, 不靠付费墙赌增长.
            就这条路: 找到 100 个真懂的人, 跟我们一起把"决策档案"这件 AI 时代才能做的事, 做出来.
          </p>
          <p className="font-serif italic text-reading text-ink-500 editorial-leading mb-12">
            5 年后这是个人资产的新维度. 10 年后是行业基础设施. 现在是 day 1.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/invite"
              className="inline-block px-10 py-3.5 font-serif text-base text-paper bg-ink-900 hover:bg-seal-500 transition-colors text-center"
            >
              已有邀请码 → 激活
            </Link>
            <Link
              href="/why-key"
              className="inline-block px-10 py-3.5 font-serif text-base border-2 border-seal-500 text-seal-500 hover:bg-seal-500 hover:text-paper transition-colors text-center"
            >
              先看战略叙事
            </Link>
          </div>

          <div className="text-center pt-12">
            <p className="font-serif italic text-reading text-ink-500 mb-2">
              — 写于 keypoint.life · 春 · MMXXVI
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
              KEY 创始人
            </p>
          </div>
        </section>

        <footer className="pt-16 text-center font-mono text-[10px] uppercase tracking-widest text-ink-400">
          keypoint.life · 你的档案存在境外节点 · 永不进训练数据
        </footer>
      </main>
    </div>
  );
}
