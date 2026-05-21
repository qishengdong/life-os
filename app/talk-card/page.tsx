/**
 * /talk-card — KEY 30 秒话术卡 · 5/20 ship · A3
 *
 * 用户拿在手里的 sales 武器. 浏览器 → 打印 → "另存为 PDF" → 随身带.
 *
 * 不在主导航里 (内部工具). 用户访问 /talk-card 看完整版 + 一键打印.
 *
 * 正面 (A 面):
 *   - 30 秒电梯版 × 3 (科技人 / 中产 / 传统思维)
 *   - 9 种背景类比库 (保险/律师/会计/投资/媒体/咨询师/科技/传统中年/大众)
 *
 * 反面 (B 面):
 *   - 6 种反弹 script
 *   - 终极话术: "听不懂是 feature, 不是 bug"
 *
 * print CSS:
 *   - A4 size · 2 页 · 字体足够大可读
 *   - 去除导航 / button / 链接 hover 装饰
 */
'use client';

import Link from 'next/link';
import KeyWordmark from '@/components/KeyWordmark';

export default function TalkCardPage() {
  return (
    <>
      {/* 打印专用 CSS */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }
          body { background: white !important; }
          .no-print { display: none !important; }
          .page-break { page-break-after: always; }
          .print-shadow { box-shadow: none !important; border: 1px solid #d4d0c5 !important; }
          a { color: inherit !important; text-decoration: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-paper text-ink-900">
        {/* 顶部导航 + 打印按钮 · 打印时不显示 */}
        <nav className="no-print max-w-prose-xl mx-auto px-6 pt-10 pb-6 flex justify-between items-baseline">
          <Link href="/" aria-label="KEY home" className="block">
            <KeyWordmark variant="nav" height={22} />
          </Link>
          <div className="flex gap-4 items-baseline">
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-ink-500">
              KEY · 30 秒话术卡 · 创始人内部用
            </p>
            <button
              onClick={() => window.print()}
              className="px-5 py-2 font-serif text-[14px] text-paper bg-ink-900 hover:bg-seal-500 transition-colors"
            >
              打印 / 另存为 PDF →
            </button>
          </div>
        </nav>

        <main className="max-w-prose-md mx-auto px-6 pb-24">
          {/* 使用说明 · 打印时不显示 */}
          <div className="no-print pt-4 pb-10 border-b border-paper-300 mb-12">
            <p className="font-serif italic text-[14px] text-ink-500 leading-relaxed">
              这是你随身带的 sales 武器. 按 Cmd+P (Mac) / Ctrl+P (Windows) → "另存为 PDF" → 打印或存手机里.
              碰到保险经纪 / 投资人 / 老一辈不懂 KEY 的, 递这张. 比口头解释强 100 倍.
            </p>
          </div>

          {/* ============================================================ */}
          {/* A 面 · 30 秒电梯版 + 9 种类比                                 */}
          {/* ============================================================ */}
          <section className="page-break pb-12">
            {/* 卡片头 */}
            <header className="border-b-2 border-ink-900 pb-4 mb-8">
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-seal-500 mb-1">
                    · KEY · 30 秒话术卡 ·
                  </p>
                  <h1 className="font-serif text-2xl text-ink-900 tracking-tightish">
                    A 面 · 怎么说清 KEY.
                  </h1>
                </div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-ink-400">
                  keypoint.life · MMXXVI
                </p>
              </div>
            </header>

            {/* 3 个 30 秒电梯版 */}
            <div className="mb-10">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
                · I. 30 秒电梯 · 3 种背景版 ·
              </p>

              <div className="space-y-5">
                <div className="border-l-2 border-seal-500/40 pl-5">
                  <p className="font-serif italic text-[12px] text-seal-500 mb-1">— 给科技人 —</p>
                  <p className="font-serif text-[14px] text-ink-700 leading-relaxed">
                    "Notion + AI 长期记忆 + 决策资产化. 用户每天 30 秒一句, 大决定时 KEY 调用其 30 天真话作为证据.
                    30/90/365 天后端回访验证判断."
                  </p>
                </div>

                <div className="border-l-2 border-seal-500/40 pl-5">
                  <p className="font-serif italic text-[12px] text-seal-500 mb-1">— 给中产 —</p>
                  <p className="font-serif text-[14px] text-ink-700 leading-relaxed">
                    "决策档案. 你每天 30 秒写一句真话. 大决定时 KEY 把你之前的话调出来作证.
                    30 天后 KEY 回头问你 — 你担心的事真发生了吗?"
                  </p>
                </div>

                <div className="border-l-2 border-seal-500/40 pl-5">
                  <p className="font-serif italic text-[12px] text-seal-500 mb-1">— 给传统思维 (保险/律师/老一辈) —</p>
                  <p className="font-serif text-[14px] text-ink-700 leading-relaxed">
                    "你这辈子做过几个大决定? 当时怎么想的, 你还记得吗? KEY 让你以后每个大决定,
                    30 年后还能找到你**当时真说什么**."
                  </p>
                </div>
              </div>
            </div>

            {/* 9 种类比库 */}
            <div>
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
                · II. 9 种类比库 · 按对方背景选 ·
              </p>

              <table className="w-full text-[13px] font-serif">
                <thead>
                  <tr className="border-b border-paper-300">
                    <th className="text-left py-2 pr-3 font-sans uppercase text-[9px] tracking-widest text-ink-500 w-32">对方背景</th>
                    <th className="text-left py-2 font-sans uppercase text-[9px] tracking-widest text-ink-500">一句话比喻</th>
                  </tr>
                </thead>
                <tbody className="text-ink-700">
                  <tr className="border-b border-paper-200">
                    <td className="py-2 pr-3 font-semibold">保险经纪</td>
                    <td className="py-2">"保险兑付钱, KEY 兑付**你当时的清醒**"</td>
                  </tr>
                  <tr className="border-b border-paper-200">
                    <td className="py-2 pr-3 font-semibold">律师</td>
                    <td className="py-2">"律师存合同, KEY 存**你的真话**"</td>
                  </tr>
                  <tr className="border-b border-paper-200">
                    <td className="py-2 pr-3 font-semibold">会计师</td>
                    <td className="py-2">"会计师存账, KEY 存**你的判断**"</td>
                  </tr>
                  <tr className="border-b border-paper-200">
                    <td className="py-2 pr-3 font-semibold">投资人</td>
                    <td className="py-2">"Bloomberg 给别人的数据, KEY 给**你自己的轨迹**"</td>
                  </tr>
                  <tr className="border-b border-paper-200">
                    <td className="py-2 pr-3 font-semibold">媒体人</td>
                    <td className="py-2">"档案给历史作证, KEY 给**你的人生**作证"</td>
                  </tr>
                  <tr className="border-b border-paper-200">
                    <td className="py-2 pr-3 font-semibold">心理咨询师</td>
                    <td className="py-2">"咨询师给解读, KEY 让你**听见你刚说的话**"</td>
                  </tr>
                  <tr className="border-b border-paper-200">
                    <td className="py-2 pr-3 font-semibold">科技人</td>
                    <td className="py-2">"Notion + AI 长期记忆 + 决策资产化"</td>
                  </tr>
                  <tr className="border-b border-paper-200">
                    <td className="py-2 pr-3 font-semibold">传统中年</td>
                    <td className="py-2">"你 30 年后还想知道**当年自己怎么想**吗?"</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-semibold">大众</td>
                    <td className="py-2">"ChatGPT 每次重新认识你. KEY **有记性**"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ============================================================ */}
          {/* B 面 · 6 种反弹 script + 终极话术                            */}
          {/* ============================================================ */}
          <section>
            <header className="border-b-2 border-ink-900 pb-4 mb-8">
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-seal-500 mb-1">
                    · KEY · 30 秒话术卡 ·
                  </p>
                  <h1 className="font-serif text-2xl text-ink-900 tracking-tightish">
                    B 面 · 对方反弹时怎么答.
                  </h1>
                </div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-ink-400">
                  反 6 + 终极
                </p>
              </div>
            </header>

            <div className="mb-8">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
                · III. 6 种反弹 script ·
              </p>

              <div className="space-y-5">
                <div className="border-l-2 border-paper-300 pl-5">
                  <p className="font-serif italic text-[12px] text-ember mb-1">— "这跟日记有啥区别?" —</p>
                  <p className="font-serif text-[13px] text-ink-700 leading-relaxed">
                    "日记是被动归档, 你 3 个月后翻不到. KEY 在你做大决定时**主动**端给你 — 在你需要的时刻."
                  </p>
                </div>

                <div className="border-l-2 border-paper-300 pl-5">
                  <p className="font-serif italic text-[12px] text-ember mb-1">— "AI 不就是 ChatGPT?" —</p>
                  <p className="font-serif text-[13px] text-ink-700 leading-relaxed">
                    "ChatGPT 没记忆, 每次重新认识你. KEY 有记性, 用得越久越值钱. ChatGPT 是泛智, KEY 是**你的智**."
                  </p>
                </div>

                <div className="border-l-2 border-paper-300 pl-5">
                  <p className="font-serif italic text-[12px] text-ember mb-1">— "我做决定自己想得清楚" —</p>
                  <p className="font-serif text-[13px] text-ink-700 leading-relaxed">
                    "你 30 天后能复盘吗? 不能. 你不是想不清楚, 是**记不住自己当时怎么想**.
                    一年后你看自己的决策档案, 比看任何咨询师的笔记都有用."
                  </p>
                </div>

                <div className="border-l-2 border-paper-300 pl-5">
                  <p className="font-serif italic text-[12px] text-ember mb-1">— "¥1988 太贵了" —</p>
                  <p className="font-serif text-[13px] text-ink-700 leading-relaxed">
                    "一份小保单的价格. 你 30 年大决定的清醒度, 值多少? 跟保险一样 — 现在的小动作, 兑现在未来."
                  </p>
                </div>

                <div className="border-l-2 border-paper-300 pl-5">
                  <p className="font-serif italic text-[12px] text-ember mb-1">— "AI 编造怎么办?" —</p>
                  <p className="font-serif text-[13px] text-ink-700 leading-relaxed">
                    "KEY 不让 AI 编你的话. anti-hallucination 是产品底线 — 它只把你说过的还给你, 一字不改."
                  </p>
                </div>

                <div className="border-l-2 border-paper-300 pl-5">
                  <p className="font-serif italic text-[12px] text-ember mb-1">— "保护隐私吗?" —</p>
                  <p className="font-serif text-[13px] text-ink-700 leading-relaxed">
                    "档案存在 Turso (海外节点), 永不进训练数据. 你可以一键导出 / 删除. KEY 不卖广告, 你付钱, 不是被卖."
                  </p>
                </div>
              </div>
            </div>

            {/* 终极话术 */}
            <div className="border-2 border-ink-900 p-6 print-shadow bg-paper-50">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-900 mb-3">
                · IV. 终极话术 · 对方说"听不懂..." ·
              </p>
              <p className="font-serif text-[15px] text-ink-900 leading-relaxed mb-3">
                <strong>(轻笑) "这就是答案. KEY 不卖给所有人. 卖给**做大决定时想知道自己当时怎么想**的人.</strong>
              </p>
              <p className="font-serif italic text-[13px] text-ink-500 leading-relaxed">
                创新产品永远只对 5% 早期用户清晰. 你听不懂, 是因为你不在这 5% 里 — 这不是你的错, 也不是产品的错.
                我们做的是**第四类个人资产**: 钱 / 房 / 人脉之外的判断力档案. 5 年后这是基础设施."
              </p>
            </div>

            <p className="mt-8 pt-6 border-t border-paper-300 font-serif italic text-[12px] text-ink-500 text-center">
              "听不懂是 feature, 不是 bug." — Peter Thiel: <em>If many people agree with you, your idea has no value.</em>
            </p>
          </section>

          {/* Footer */}
          <footer className="pt-12 mt-12 border-t border-paper-300 text-center">
            <p className="font-mono text-[9px] uppercase tracking-widest text-ink-400">
              keypoint.life · 内部用 · MMXXVI 春
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
