import Link from 'next/link';

export const metadata = {
  title: '关于 / 隐私 / 协议 — Life OS',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 flex justify-between items-baseline">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">关于 Life OS</h1>
            <p className="text-zinc-400">服务说明 / 隐私 / 协议</p>
          </div>
          <Link href="/" className="text-zinc-400 hover:text-zinc-100 text-sm transition">
            ← 返回
          </Link>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">这是什么?</h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            Life OS 是一个 AI 决策辅助工具, 给中国 30-50 岁高知精英用. 当你面对重大人生决策
            (要不要离职 / 要不要送父母去养老院 / 要不要离婚 / 要不要送孩子出国), 它帮你把决策结构展示出来,
            问你硬核问题, <strong className="text-zinc-100">但不替你做决定</strong>.
          </p>
          <p className="text-zinc-300 leading-relaxed">
            它不是心理咨询 / 不是法律咨询 / 不是投资顾问. 它是基于决策科学 (Annie Duke / Chip Heath / Kahneman)
            和中国本土心理研究 (武志红 / 陈海贤) 设计的"反鸡汤决策伴侣".
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">这不是什么</h2>
          <ul className="space-y-2 text-zinc-300 list-disc list-inside">
            <li>不是心理治疗师 — 涉及自伤 / 抑郁请联系 010-82951332</li>
            <li>不是律师 — 涉及法律纠纷请咨询律师</li>
            <li>不是医生 — 涉及医疗决策请咨询医生</li>
            <li>不是财务顾问 — 涉及具体投资请咨询财务顾问</li>
            <li>不是真人朋友的替代 — AI 是 supplement, 不是 substitute</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">数据隐私底线</h2>
          <ul className="space-y-3 text-zinc-300">
            <li>✦ 你的全部数据存在我们 VPS, 不出境 (中国大陆主版)</li>
            <li>✦ 我们不卖数据 / 不做广告画像 / 不训练模型</li>
            <li>✦ 我们调 DeepSeek API 时不带你的 user_id</li>
            <li>✦ 你可一键导出 / 删除全部数据 (V1.5)</li>
            <li>
              ✦ 完整隐私政策见{' '}
              <Link href="/privacy" className="text-zinc-100 underline hover:text-white">
                /privacy
              </Link>
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">紧急资源</h2>
          <p className="text-zinc-300 mb-3">如果你或身边人正面临心理危机:</p>
          <ul className="space-y-2 text-zinc-300">
            <li>北京心理危机干预中心 24h: <strong className="text-amber-300">010-82951332</strong></li>
            <li>全国心理援助热线: <strong className="text-amber-300">400-161-9995</strong></li>
            <li>反家暴全国热线: <strong className="text-amber-300">12338</strong></li>
          </ul>
        </section>

        <section className="mb-12 grid grid-cols-2 gap-4">
          <Link href="/privacy" className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-600 transition">
            <h3 className="font-semibold mb-2">隐私政策</h3>
            <p className="text-zinc-500 text-sm">数据收集 / 存储 / 你的权利</p>
          </Link>
          <Link href="/terms" className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-600 transition">
            <h3 className="font-semibold mb-2">服务协议</h3>
            <p className="text-zinc-500 text-sm">使用规则 / 责任边界 / 付费</p>
          </Link>
        </section>

        <footer className="text-center text-zinc-700 text-xs pt-8 border-t border-zinc-900">
          Life OS V0 · 备案号 TBD · 运营主体 TBD
        </footer>
      </div>
    </div>
  );
}
