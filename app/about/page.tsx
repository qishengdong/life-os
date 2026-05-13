import Link from 'next/link';
import KeyWordmark from '@/components/KeyWordmark';

export const metadata = {
  title: '关于 KEY',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper">
      <nav className="max-w-prose-xl mx-auto px-6 pt-8 pb-6 flex justify-between items-baseline">
        <Link href="/" aria-label="KEY home" className="block">
          <KeyWordmark variant="nav" height={22} />
        </Link>
        <div className="flex gap-6 text-sm text-ink-500">
          <Link href="/" className="hover:text-seal transition-colors">← 回主页</Link>
        </div>
      </nav>

      <main className="max-w-prose-xl mx-auto px-6 pb-20">
        <header className="pt-12 pb-12 animate-fade-in-soft">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-seal mb-6">
            · Colophon ·
          </p>
          <h1 className="font-serif text-editorial-lg text-ink-900 mb-4 tracking-tighter">
            关于 KEY
          </h1>
          <p className="font-serif text-reading text-ink-500 editorial-leading max-w-prose-lg">
            服务说明 / 边界 / 隐私 / 紧急资源
          </p>
        </header>

        <section className="mb-16 animate-fade-in-soft">
          <p className="font-serif text-2xl text-seal mb-3 tracking-tightish leading-tight">
            重大决定, 别一个人硬扛。
          </p>
          <h2 className="font-serif text-3xl text-ink-900 mb-6 tracking-tighter leading-tight">
            陪你把人生难题想清楚。
          </h2>
          <div className="prose prose-editorial max-w-none font-serif">
            <p>
              KEY 是给中国 30-50 岁高知精英的<strong>日常思考伴侣 + 重大决策系统</strong>.
              父母养老、孩子出路、婚姻去留、职业转身、要不要迁移——
              这些决定太重, 不能只靠冲动, 也不能靠几句安慰.
            </p>
            <p>
              <strong>KEY 不替你做决定, 也不用鸡汤安慰你.</strong>
              它记得你的背景, 陪你一步步拆开真正困住你的问题.
            </p>
            <p>
              它不是心理咨询. 不是法律咨询. 不是投资顾问. 它是基于决策科学
              (Annie Duke / Chip Heath / Kahneman) 和中国本土心理研究
              (武志红 / 陈海贤) 设计的<em>思考伴侣</em>.
            </p>
            <p className="text-xl italic text-ink-900 border-l-4 border-seal pl-6 my-10 leading-snug">
              在人生最难选的时候, 有一个长期记得你的人。
            </p>
          </div>
        </section>

        <section className="mb-16 animate-fade-in-soft">
          <h2 className="font-serif text-2xl text-ink-900 mb-5 tracking-tightish">
            这不是什么
          </h2>
          <ul className="font-serif text-reading text-ink-700 space-y-3 editorial-leading">
            <li className="flex gap-3">
              <span className="text-seal">·</span>
              <span>不是心理治疗师 — 涉及自伤 / 抑郁请联系 <span className="font-mono text-seal">010-82951332</span></span>
            </li>
            <li className="flex gap-3">
              <span className="text-seal">·</span>
              <span>不是律师 — 涉及法律纠纷请咨询律师</span>
            </li>
            <li className="flex gap-3">
              <span className="text-seal">·</span>
              <span>不是医生 — 涉及医疗决策请咨询医生</span>
            </li>
            <li className="flex gap-3">
              <span className="text-seal">·</span>
              <span>不是财务顾问 — 涉及具体投资请咨询财务顾问</span>
            </li>
            <li className="flex gap-3">
              <span className="text-seal">·</span>
              <span>不是真人朋友的替代 — AI 是 supplement, 不是 substitute</span>
            </li>
          </ul>
        </section>

        <section className="mb-16 animate-fade-in-soft">
          <h2 className="font-serif text-2xl text-ink-900 mb-5 tracking-tightish">
            隐私底线
          </h2>
          <ul className="font-serif text-reading text-ink-700 space-y-3 editorial-leading">
            <li className="flex gap-3">
              <span className="text-seal font-mono">01</span>
              <span>你的全部数据存在我们的服务器, 不出境 (中国大陆主版)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-seal font-mono">02</span>
              <span>我们不卖数据 / 不做广告画像 / 不训练模型</span>
            </li>
            <li className="flex gap-3">
              <span className="text-seal font-mono">03</span>
              <span>我们调用 DeepSeek API 时不附带你的 user_id</span>
            </li>
            <li className="flex gap-3">
              <span className="text-seal font-mono">04</span>
              <span>你可一键导出 / 删除全部数据 (V1.5)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-seal font-mono">05</span>
              <span>完整隐私政策见{' '}
                <Link href="/privacy" className="text-seal underline hover:text-seal-600">privacy</Link>
              </span>
            </li>
          </ul>
        </section>

        <section className="mb-16 animate-fade-in-soft">
          <h2 className="font-serif text-2xl text-ink-900 mb-5 tracking-tightish">
            紧急资源
          </h2>
          <p className="font-serif text-reading text-ink-500 mb-4">
            如果你或身边的人正面临心理危机:
          </p>
          <div className="bg-paper-200 border-l-4 border-seal p-6 space-y-2 font-serif text-ink-700">
            <div className="flex justify-between items-baseline">
              <span>北京心理危机干预中心 24h</span>
              <span className="font-mono text-seal">010-82951332</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span>全国心理援助热线</span>
              <span className="font-mono text-seal">400-161-9995</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span>反家暴全国热线</span>
              <span className="font-mono text-seal">12338</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          <Link href="/privacy" className="border border-paper-300 rounded-sm p-6 hover:border-seal transition-colors group">
            <h3 className="font-serif text-lg text-ink-900 mb-2 group-hover:text-seal">隐私政策</h3>
            <p className="text-sm text-ink-500 font-sans">数据收集 / 存储 / 你的权利</p>
          </Link>
          <Link href="/terms" className="border border-paper-300 rounded-sm p-6 hover:border-seal transition-colors group">
            <h3 className="font-serif text-lg text-ink-900 mb-2 group-hover:text-seal">服务协议</h3>
            <p className="text-sm text-ink-500 font-sans">使用规则 / 责任边界 / 付费</p>
          </Link>
        </div>

        <footer className="text-center pt-8 border-t border-paper-300">
          <p className="font-mono text-xs text-ink-400">
            KEY · V1 dev · 备案号 TBD · 运营主体 TBD
          </p>
          <p className="font-serif text-sm text-ink-400 italic mt-4">
            陪你想清楚 · 看清代价 · 长期记得你
          </p>
        </footer>
      </main>
    </div>
  );
}
