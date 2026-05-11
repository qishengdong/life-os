import Link from 'next/link';

export const metadata = {
  title: '定价 — Life OS',
};

interface Tier {
  name: string;
  price: string;
  pricePeriod: string;
  yearly: string;
  position: string;
  bullets: { feature: string; included: boolean; emphasis?: boolean }[];
  cta: string;
  ctaStyle: 'seal' | 'ghost';
  href: string;
  badge?: string;
}

const TIERS: Tier[] = [
  {
    name: 'Free',
    price: '¥0',
    pricePeriod: '',
    yearly: '永久免费',
    position: '体验层 — 让你养成"每天接住一个信号"的习惯',
    bullets: [
      { feature: 'Daily Pulse — 每天 3 分钟', included: true, emphasis: true },
      { feature: '5 类轮换问题 + 10 类自动标签', included: true },
      { feature: '7-14 天 memory 保留', included: true },
      { feature: 'Sunday Review — 极简版', included: true },
      { feature: '每月 1 次简版决策拆解 (6 维)', included: true },
      { feature: '完整 Life Brain', included: false },
      { feature: 'Outcome Tracking', included: false },
      { feature: 'open_loops 回调', included: false },
      { feature: '30 天主题陪伴', included: false },
    ],
    cta: '免费开始',
    ctaStyle: 'ghost',
    href: '/onboarding',
  },
  {
    name: 'Pro',
    price: '¥99',
    pricePeriod: '/ 月',
    yearly: '年付 ¥999 (省 ¥189)',
    position: '核心订阅 — Life OS 真正的"长期思考伴侣"',
    badge: '⭐ 主流选择',
    bullets: [
      { feature: 'Daily Pulse — 不限次数', included: true, emphasis: true },
      { feature: '永久 memory', included: true },
      { feature: '完整 Life Brain (周期蒸馏 + 用户可见)', included: true, emphasis: true },
      { feature: 'Sunday Review — 完整 800-1200 字', included: true, emphasis: true },
      { feature: '不限次数 12 维决策深潜', included: true, emphasis: true },
      { feature: 'Outcome Tracking (30/90/365 day 回访)', included: true, emphasis: true },
      { feature: 'open_loops 主动 callback', included: true },
      { feature: '月度《重大决策地图》', included: true },
      { feature: '30 天主题陪伴', included: false },
      { feature: 'AI Board 多角色推演', included: false },
    ],
    cta: '订阅 Pro',
    ctaStyle: 'seal',
    href: '/onboarding?intent=pro',
  },
  {
    name: 'Premium',
    price: '¥299',
    pricePeriod: '/ 月',
    yearly: '年付 ¥2999 (省 ¥589)',
    position: '深度陪伴层 — 给真高净值 / 真复杂决策时刻的人',
    bullets: [
      { feature: 'Pro 全部功能', included: true, emphasis: true },
      { feature: '30 天主题陪伴 (Premium 核心)', included: true, emphasis: true },
      { feature: '月度 Long-form Strategy Review (3000+ 字)', included: true, emphasis: true },
      { feature: 'AI Board 多角色推演 (理性 / 感性 / 风险 / 长期)', included: true, emphasis: true },
      { feature: '重要决策 90 天复盘', included: true },
      { feature: '优先响应 (P0 等级)', included: true },
      { feature: '早期闭门内容 + 案例库', included: true },
    ],
    cta: '订阅 Premium',
    ctaStyle: 'ghost',
    href: '/onboarding?intent=premium',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-paper">
      <nav className="max-w-prose-xl mx-auto px-6 pt-8 pb-6 flex justify-between items-baseline">
        <Link href="/" className="font-serif text-xl font-semibold tracking-tightish text-ink-900">
          Life OS
        </Link>
        <div className="flex gap-6 text-sm text-ink-500">
          <Link href="/" className="hover:text-seal transition-colors">← 回主页</Link>
        </div>
      </nav>

      <main className="max-w-prose-xl mx-auto px-6 pb-20">
        <header className="pt-16 pb-12 animate-fade-in-soft text-center">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-seal mb-6">
            · Subscription ·
          </p>
          <p className="font-serif text-xl md:text-2xl text-seal mb-3 tracking-tightish">
            重大决定, 别一个人硬扛。
          </p>
          <h1 className="font-serif text-editorial-lg text-ink-900 mb-6 tracking-tighter">
            为"它越来越懂你"付费,<br />不是为"再问一次"付费.
          </h1>
          <p className="font-serif text-reading text-ink-500 editorial-leading max-w-prose-lg mx-auto">
            Life OS 越用越懂你, 跨决策保持一致, 12 个月后你的数据是不可迁移的人生资产.
            按次计费惩罚高频用户, 订阅才符合产品本质.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 max-w-5xl mx-auto">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative bg-paper-50 border rounded-sm p-8 ${
                tier.badge ? 'border-seal shadow-sm' : 'border-paper-300'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-seal text-paper text-xs font-sans px-3 py-1 rounded-sm">
                    {tier.badge}
                  </span>
                </div>
              )}

              <header className="mb-6 pb-6 border-b border-paper-300">
                <h2 className="font-serif text-2xl text-ink-900 mb-2">{tier.name}</h2>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-serif text-4xl text-ink-900 font-semibold tracking-tighter">
                    {tier.price}
                  </span>
                  <span className="text-ink-500 font-sans text-sm">{tier.pricePeriod}</span>
                </div>
                <p className="font-mono text-xs text-ink-400 mb-3">{tier.yearly}</p>
                <p className="font-serif text-sm text-ink-500 leading-relaxed">{tier.position}</p>
              </header>

              <ul className="space-y-2.5 mb-8 min-h-[280px]">
                {tier.bullets.map((b, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${b.included ? 'text-ink-700' : 'text-ink-300'}`}>
                    <span className={`font-mono mt-0.5 ${b.included ? 'text-seal' : 'text-ink-300'}`}>
                      {b.included ? '✓' : '—'}
                    </span>
                    <span className={`font-serif ${b.emphasis && b.included ? 'font-medium text-ink-900' : ''}`}>
                      {b.feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.href}
                className={`block text-center py-3 rounded-sm font-medium transition-all ${
                  tier.ctaStyle === 'seal' ? 'btn-seal' : 'btn-ghost'
                }`}
              >
                {tier.cta} →
              </Link>
            </div>
          ))}
        </div>

        {/* 反 SaaS 套路说明 */}
        <section className="max-w-prose-lg mx-auto mb-16 animate-fade-in-soft">
          <h2 className="font-serif text-2xl text-ink-900 mb-6 text-center tracking-tightish">
            为什么这个价格?
          </h2>
          <div className="prose prose-editorial max-w-none font-serif">
            <p>
              ¥99/月 ≈ 一顿日料.
              对照同类:
            </p>
            <ul>
              <li><strong>Notion Pro</strong> ¥80/月 — 是工具, 不懂你</li>
              <li><strong>Day One Premium</strong> ¥30/月 — 是日记本, 不回应</li>
              <li><strong>ChatGPT Plus</strong> $20/月 — 不持久, 不个性化</li>
              <li><strong>真人心理咨询</strong> ¥800-3000/次, 月均 ¥4000+ — 太慢, 一周一次</li>
              <li><strong>商业教练</strong> ¥3000-15000/小时 — 太贵, 一年几次</li>
            </ul>
            <p>
              <strong>Life OS Pro</strong> = Notion + Day One + 心理咨询师 1/40 价 + 它只懂你一个人.
            </p>
            <p className="italic text-seal">
              "我的人生备忘录 + 思考伴侣 + 重大决策军师 — 一份外卖钱."
            </p>
          </div>
        </section>

        <section className="max-w-prose-lg mx-auto mb-12 animate-fade-in-soft border-t border-paper-300 pt-12">
          <h2 className="font-serif text-2xl text-ink-900 mb-6 tracking-tightish">
            常见问题
          </h2>
          <dl className="space-y-8 font-serif">
            <div>
              <dt className="text-ink-900 mb-2 font-medium">退款政策?</dt>
              <dd className="text-ink-500 text-reading editorial-leading">7 天内未使用可全额退款. 已使用部分按比例退.</dd>
            </div>
            <div>
              <dt className="text-ink-900 mb-2 font-medium">可以从 Free 升级到 Pro 吗?</dt>
              <dd className="text-ink-500 text-reading editorial-leading">任何时候可升级. 你的 memory / brain / 决策历史全部保留. 升级后 7-14 天的 memory 限制立即解除.</dd>
            </div>
            <div>
              <dt className="text-ink-900 mb-2 font-medium">支付方式?</dt>
              <dd className="text-ink-500 text-reading editorial-leading">国内: 微信支付 + 支付宝. 海外: Stripe (信用卡 / Apple Pay).</dd>
            </div>
            <div>
              <dt className="text-ink-900 mb-2 font-medium">取消订阅?</dt>
              <dd className="text-ink-500 text-reading editorial-leading">在 /account 一键取消. 当前周期结束前仍可使用. 你的数据永久保留 (不删) 直到你主动要求删除.</dd>
            </div>
            <div>
              <dt className="text-ink-900 mb-2 font-medium">公司 / 团队 / 家庭账号?</dt>
              <dd className="text-ink-500 text-reading editorial-leading">V1 仅个人订阅. 家庭 / 团队方案在 V2 路线图.</dd>
            </div>
          </dl>
        </section>

        <footer className="text-center pt-8 border-t border-paper-300">
          <p className="font-mono text-xs text-ink-400 mb-2">
            Life OS · V1 dev · 上线后正式开通支付
          </p>
          <p className="font-serif text-sm text-ink-400 italic">
            在人生最难选的时候, 有一个长期记得你的人.
          </p>
        </footer>
      </main>
    </div>
  );
}
