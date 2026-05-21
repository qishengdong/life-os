/**
 * /investor-deck — 5% 真用户画像 + 商业模式 · 5/20 ship · B1
 *
 * 给投资人 / 路演 / 朋友 due diligence 用的一页 PDF.
 * 打印 → 另存为 PDF → 见投资人前发邮件 / 现场递.
 *
 * 不是融资 deck (40 页那种). 是一页纸真信号:
 *   - 5% 真用户画像 6 维
 *   - 数字真锚 (中国 200 万 × 0.5% = ¥1988 万年付)
 *   - Linda × 5 案例脱敏
 *   - 6 层商业模式收入对应表 (5/10 年预期)
 *
 * 不在主导航里 (内部工具).
 */
'use client';

import Link from 'next/link';
import KeyWordmark from '@/components/KeyWordmark';

export default function InvestorDeckPage() {
  return (
    <>
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
        <nav className="no-print max-w-prose-xl mx-auto px-6 pt-10 pb-6 flex justify-between items-baseline">
          <Link href="/" aria-label="KEY home" className="block">
            <KeyWordmark variant="nav" height={22} />
          </Link>
          <div className="flex gap-4 items-baseline">
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-ink-500">
              KEY · 投资人简报 · 创始人内部用
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
          <div className="no-print pt-4 pb-10 border-b border-paper-300 mb-12">
            <p className="font-serif italic text-[14px] text-ink-500 leading-relaxed">
              这一页 PDF 替你回答投资人最常问的 3 个问题: "市场多大?" / "你的用户是谁?" / "商业模式跑得通吗?"
              Cmd+P 另存 PDF, 见投资人前邮件发去, 见面 5 分钟就进真问题.
            </p>
          </div>

          {/* ============================================================ */}
          {/* P1 · 5% 真用户画像                                            */}
          {/* ============================================================ */}
          <section className="page-break">
            <header className="border-b-2 border-ink-900 pb-4 mb-8">
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-seal-500 mb-1">
                    · KEY · 投资人简报 ·
                  </p>
                  <h1 className="font-serif text-2xl text-ink-900 tracking-tightish">
                    P1 · 我们卖给谁 · 0.5% 不是 100%.
                  </h1>
                </div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-ink-400">
                  keypoint.life · MMXXVI · 春
                </p>
              </div>
            </header>

            {/* 数字真锚 */}
            <div className="mb-8 border-l-2 border-seal-500 pl-5 bg-paper-50 py-4">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">
                · 数字真锚 ·
              </p>
              <p className="font-serif text-[15px] text-ink-900 leading-relaxed mb-2">
                中国 35-45 岁高知中产符合 5% 画像者 <strong>约 200 万人</strong>.
              </p>
              <p className="font-serif text-[15px] text-ink-900 leading-relaxed mb-2">
                KEY 目标: <strong>其中 0.5% = 1 万付费用户 × ¥1988/年 = ¥1988 万年付收入</strong>.
              </p>
              <p className="font-serif italic text-[13px] text-ink-500 leading-relaxed">
                不需要全民懂 KEY. "听不懂"是 feature, 不是 bug. — Peter Thiel
              </p>
            </div>

            {/* 6 维画像 */}
            <div className="mb-8">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
                · 5% 画像 · 6 维 ·
              </p>

              <table className="w-full text-[13px] font-serif">
                <thead>
                  <tr className="border-b border-paper-300">
                    <th className="text-left py-2 pr-3 font-sans uppercase text-[9px] tracking-widest text-ink-500 w-32">维度</th>
                    <th className="text-left py-2 font-sans uppercase text-[9px] tracking-widest text-ink-500">真锚</th>
                  </tr>
                </thead>
                <tbody className="text-ink-700">
                  <tr className="border-b border-paper-200">
                    <td className="py-2 pr-3 font-semibold">年龄</td>
                    <td className="py-2">35-45 岁</td>
                  </tr>
                  <tr className="border-b border-paper-200">
                    <td className="py-2 pr-3 font-semibold">经历</td>
                    <td className="py-2">至少 1 次大决定 (跳槽 / 离婚 / 创业 / 父母重病 / 移民)</td>
                  </tr>
                  <tr className="border-b border-paper-200">
                    <td className="py-2 pr-3 font-semibold">付费历史</td>
                    <td className="py-2">已付 Notion / flomo / 得到 / 樊登 / 微信读书 / Day One 至少 1 个</td>
                  </tr>
                  <tr className="border-b border-paper-200">
                    <td className="py-2 pr-3 font-semibold">AI 熟练度</td>
                    <td className="py-2">用过 ChatGPT, 知道它会编造 (不依赖, 不陌生)</td>
                  </tr>
                  <tr className="border-b border-paper-200">
                    <td className="py-2 pr-3 font-semibold">家庭年收入</td>
                    <td className="py-2">≥ 60 万 (¥1988/年 不焦虑)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-semibold">朋友圈特征</td>
                    <td className="py-2">"那个会写长反思的人"</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Linda × 5 案例脱敏 */}
            <div>
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
                · 真案例 · 内测 Linda × 5 (脱敏) ·
              </p>
              <ul className="space-y-3 font-serif text-[13px] text-ink-700 editorial-leading">
                <li className="flex items-baseline gap-3">
                  <span className="font-serif italic text-seal-500 w-6 shrink-0">L1</span>
                  <span>42 岁 · 投资 MD · 母亲新近失智 + 自己工作 60h/周 · 已付 Notion + 得到 · 决策焦虑: 要不要从美元基金转人民币基金</span>
                </li>
                <li className="flex items-baseline gap-3">
                  <span className="font-serif italic text-seal-500 w-6 shrink-0">L2</span>
                  <span>38 岁 · 前主编 · 离婚程序中 · 已付 flomo + Day One · 决策焦虑: 要不要把孩子带出国留学</span>
                </li>
                <li className="flex items-baseline gap-3">
                  <span className="font-serif italic text-seal-500 w-6 shrink-0">L3</span>
                  <span>45 岁 · 二次创业者 · 儿子在前妻处 · 已付樊登 + 得到 · 决策焦虑: 接 A 轮还是再撑 6 个月</span>
                </li>
                <li className="flex items-baseline gap-3">
                  <span className="font-serif italic text-seal-500 w-6 shrink-0">L4</span>
                  <span>33 岁 · 心理咨询师博士 · 跟母亲关系撕裂 · 已付 Notion + 微信读书 · 决策焦虑: 要不要开私人执业</span>
                </li>
                <li className="flex items-baseline gap-3">
                  <span className="font-serif italic text-seal-500 w-6 shrink-0">L5</span>
                  <span>40 岁 · 律所合伙人 · 父亲重病 + 自己也开始有健康问题 · 已付 Day One + 得到 · 决策焦虑: 升 senior partner 还是缩规模回家</span>
                </li>
              </ul>
            </div>
          </section>

          {/* ============================================================ */}
          {/* P2 · 6 层商业模式收入对应表                                  */}
          {/* ============================================================ */}
          <section>
            <header className="border-b-2 border-ink-900 pb-4 mb-8">
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-seal-500 mb-1">
                    · KEY · 投资人简报 ·
                  </p>
                  <h1 className="font-serif text-2xl text-ink-900 tracking-tightish">
                    P2 · 6 层延伸 · ¥1988 → 决策力央行.
                  </h1>
                </div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-ink-400">
                  10 年 roadmap
                </p>
              </div>
            </header>

            <p className="font-serif text-[14px] text-ink-700 leading-relaxed mb-6">
              KEY 不是 app, 是基础设施. 类比: FICO 不是借贷 app, 是信用体系. LinkedIn 不是职场 app, 是职业身份基础设施.
              <strong className="text-ink-900"> KEY 是个人决策力的发行机构.</strong>
            </p>

            <table className="w-full text-[12px] font-serif">
              <thead>
                <tr className="border-b-2 border-ink-900">
                  <th className="text-left py-2 pr-2 font-sans uppercase text-[9px] tracking-widest text-ink-500 w-12">层</th>
                  <th className="text-left py-2 pr-2 font-sans uppercase text-[9px] tracking-widest text-ink-500 w-20">时间</th>
                  <th className="text-left py-2 pr-2 font-sans uppercase text-[9px] tracking-widest text-ink-500">产品形态</th>
                  <th className="text-left py-2 font-sans uppercase text-[9px] tracking-widest text-ink-500 w-32">收入预期</th>
                </tr>
              </thead>
              <tbody className="text-ink-700">
                <tr className="border-b border-paper-200">
                  <td className="py-3 pr-2 font-mono text-seal-500">1</td>
                  <td className="py-3 pr-2">0-3 年</td>
                  <td className="py-3 pr-2"><strong className="text-ink-900">C 端付费订阅</strong> · 决策档案 ¥1988/年</td>
                  <td className="py-3 font-mono">~¥1 亿/年<br /><span className="text-ink-400 text-[10px]">(50 万付费用户)</span></td>
                </tr>
                <tr className="border-b border-paper-200">
                  <td className="py-3 pr-2 font-mono text-seal-500">2</td>
                  <td className="py-3 pr-2">3-5 年</td>
                  <td className="py-3 pr-2"><strong className="text-ink-900">决策力分数</strong> · 类似 FICO · 婚恋/求职/尽调出示</td>
                  <td className="py-3 font-mono">API 调用 + 授权费<br /><span className="text-ink-400 text-[10px]">10×</span></td>
                </tr>
                <tr className="border-b border-paper-200">
                  <td className="py-3 pr-2 font-mono text-seal-500">3</td>
                  <td className="py-3 pr-2">5-8 年</td>
                  <td className="py-3 pr-2"><strong className="text-ink-900">决策档案继承</strong> · 父母给子女留判断力档案</td>
                  <td className="py-3 font-mono">¥5 万 一次性<br /><span className="text-ink-400 text-[10px]">+ 终身托管</span></td>
                </tr>
                <tr className="border-b border-paper-200">
                  <td className="py-3 pr-2 font-mono text-seal-500">4</td>
                  <td className="py-3 pr-2">5-10 年</td>
                  <td className="py-3 pr-2"><strong className="text-ink-900">决策保险合作</strong> · 重疾/寿险降 5-15% · 保险公司分润</td>
                  <td className="py-3 font-mono">B 端分润<br /><span className="text-ink-400 text-[10px]">~¥10 亿/年</span></td>
                </tr>
                <tr className="border-b border-paper-200">
                  <td className="py-3 pr-2 font-mono text-seal-500">5</td>
                  <td className="py-3 pr-2">5-10 年</td>
                  <td className="py-3 pr-2"><strong className="text-ink-900">企业版</strong> · VC/投行/律所高管决策档案</td>
                  <td className="py-3 font-mono">¥10-50 万/人/年<br /><span className="text-ink-400 text-[10px]">巨大市场</span></td>
                </tr>
                <tr className="bg-seal-500/5">
                  <td className="py-3 pr-2 font-mono text-seal-500 font-semibold">6</td>
                  <td className="py-3 pr-2 font-semibold">10+ 年</td>
                  <td className="py-3 pr-2 font-semibold text-ink-900">决策力央行 · 全球记账体系</td>
                  <td className="py-3 font-mono font-semibold text-seal-500">$100 亿 - $1 万亿</td>
                </tr>
              </tbody>
            </table>

            {/* 真护城河 */}
            <div className="mt-10 border-2 border-ink-900 p-5 print-shadow bg-paper-50">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-900 mb-3">
                · 真护城河 ·
              </p>
              <p className="font-serif text-[14px] text-ink-900 leading-relaxed mb-2">
                <strong>时间</strong>. 用户 6 个月后切换品牌 = 6 个月真话档案归零.
              </p>
              <p className="font-serif text-[14px] text-ink-900 leading-relaxed mb-2">
                <strong>真话档案 ≠ 数据</strong>. 用户拥有, 不进训练数据, 监管不可调取 (海外节点).
              </p>
              <p className="font-serif text-[14px] text-ink-900 leading-relaxed">
                <strong>三个条件首次同时成立</strong> · LLM 长期记忆 + 主动调用 + 决策密度危机 (35-45 岁中产). 2024 之前根本做不到.
              </p>
            </div>

            <p className="mt-8 text-center font-serif italic text-[13px] text-ink-500 leading-relaxed">
              "Monopoly only exists where consensus does not." — Peter Thiel
            </p>

            <footer className="pt-10 mt-10 border-t border-paper-300 text-center">
              <p className="font-mono text-[9px] uppercase tracking-widest text-ink-400">
                keypoint.life · 创始人内部 · MMXXVI 春
              </p>
              <p className="font-serif italic text-[12px] text-ink-500 mt-2">
                如对 KEY 感兴趣 → 邮件 hello@keypoint.life
              </p>
            </footer>
          </section>
        </main>
      </div>
    </>
  );
}
