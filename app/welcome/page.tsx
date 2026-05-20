/**
 * /welcome · 兑换后 1 屏说明 · 5/19 ship · A2
 *
 * 用户痛点 (用户 5/19 反馈):
 *   "KEY 太创新, 用户不知道是什么, 直接进 9 分钟问卷被吓跑"
 *
 * 改:
 *   /invite 兑换 → /welcome (30 秒看完) → /onboarding (建档) → /your-pattern → /home
 *
 * 不能跳过 onboarding (用户拍 5/19: 建档是 trust ritual, 必须的)
 * 但要先解释 "为什么要花 9 分钟"
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import KeyWordmark from '@/components/KeyWordmark';

/**
 * 判断当前在微信内置浏览器, 还是 iOS Safari, 还是安卓 Chrome.
 * 用来决定默认展开哪一套指南.
 */
function detectPlatform(): 'wechat' | 'ios' | 'android' | 'other' {
  if (typeof window === 'undefined') return 'other';
  const ua = window.navigator.userAgent.toLowerCase();
  if (ua.includes('micromessenger')) return 'wechat';
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (ua.includes('android')) return 'android';
  return 'other';
}

export default function WelcomePage() {
  const [platform, setPlatform] = useState<'wechat' | 'ios' | 'android' | 'other'>('other');
  const [guideOpen, setGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios');

  useEffect(() => {
    const p = detectPlatform();
    setPlatform(p);
    setActiveTab(p === 'android' ? 'android' : 'ios');
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <nav className="max-w-prose-xl mx-auto px-6 pt-10 pb-6">
        <Link href="/" aria-label="KEY home" className="block w-fit">
          <KeyWordmark variant="nav" height={22} />
        </Link>
      </nav>

      <main className="max-w-prose-md mx-auto px-6 pb-24">
        <header className="pt-8 pb-10 text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
            · 欢迎进入 KEY ·
          </p>
          <h1 className="font-serif text-editorial-lg text-ink-900 tracking-tightish leading-tight mb-6">
            进去之前, 30 秒看清楚.
          </h1>
          <p className="font-serif italic text-reading text-ink-500 leading-relaxed">
            KEY 不是日记, 不是 ChatGPT, 不是教练.<br />
            它是把你每天的真实信号, 变成未来重大决定的证据.
          </p>
        </header>

        {/* 3 步说明 · 极简 · 每段 1 句 + 1 副词 */}
        <section className="space-y-8 mb-12">
          <div className="border-l-2 border-seal-500/40 pl-6">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">
              · 1. 每天 ·
            </p>
            <h2 className="font-serif text-xl text-ink-900 tracking-tightish mb-2">
              你写一句真话.
            </h2>
            <p className="font-serif italic text-[14px] text-ink-500 leading-relaxed">
              30 秒. 想到什么写什么. 不用工整. KEY 记得.
            </p>
          </div>

          <div className="border-l-2 border-seal-500/40 pl-6">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">
              · 2. 真正卡的时候 ·
            </p>
            <h2 className="font-serif text-xl text-ink-900 tracking-tightish mb-2">
              KEY 把你之前的真话调出来.
            </h2>
            <p className="font-serif italic text-[14px] text-ink-500 leading-relaxed">
              写一份决策简报, KEY 会真引用你 X 天前说过的话作为证据.
              不是 ChatGPT 那种泛建议.
            </p>
          </div>

          <div className="border-l-2 border-seal-500/40 pl-6">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">
              · 3. 30 天后 ·
            </p>
            <h2 className="font-serif text-xl text-ink-900 tracking-tightish mb-2">
              KEY 回头问你 — 真发生了吗?
            </h2>
            <p className="font-serif italic text-[14px] text-ink-500 leading-relaxed">
              这是 KEY 跟其他 AI 真正不同的地方.
              其他 AI 答完就走, KEY 等你的真实结果, 看你判断准不准.
            </p>
          </div>
        </section>

        {/* 为什么先 9 分钟建档 */}
        <section className="mb-12 border-y border-paper-300 py-8">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-400 mb-4 text-center">
            · 第一步: 9 分钟建档 ·
          </p>
          <p className="font-serif text-reading text-ink-700 leading-relaxed mb-3">
            KEY 想真懂你, 得先听你说一遍你是谁.
          </p>
          <p className="font-serif text-reading text-ink-700 leading-relaxed mb-3">
            6 步 · 共 9 分钟 · 不催. 你写的所有答案都进你的私人档案 —
            之后每份决策简报都会从这里调引用.
          </p>
          <p className="font-serif italic text-[13px] text-ink-500 leading-relaxed">
            没建档的话, KEY 第 1 份简报会冷启动, 质量会差很多.
          </p>
        </section>

        {/* CTA */}
        <div className="text-center space-y-4">
          <Link
            href="/onboarding"
            className="inline-block px-10 py-3.5 font-serif text-base text-paper bg-ink-900 hover:bg-seal-500 transition-colors"
          >
            开始建档 (9 分钟) →
          </Link>
          <p className="font-mono text-[10px] text-ink-400 tracking-wider">
            <Link href="/how-it-works" className="hover:text-seal-500">
              · 想看更完整的说明 →
            </Link>
          </p>
        </div>

        {/* ============================================================ */}
        {/* 把 KEY 加到桌面 · 微信指南 + PWA add-to-home · 5/20 ship      */}
        {/* 用户拍板必须: 解决"找不到 KEY"流失大坑                       */}
        {/* ============================================================ */}
        <section className="mt-20 border-t border-paper-300 pt-10">
          <button
            type="button"
            onClick={() => setGuideOpen(!guideOpen)}
            className="w-full text-left flex items-baseline justify-between gap-4 group"
            aria-expanded={guideOpen}
          >
            <div>
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">
                · 30 秒 · 让 KEY 出现在你手机桌面 ·
              </p>
              <h2 className="font-serif text-xl text-ink-900 tracking-tightish group-hover:text-seal-500 transition-colors">
                把 KEY 加到桌面, 像 App 一样用.
              </h2>
            </div>
            <span className="font-mono text-[20px] text-ink-400 group-hover:text-seal-500 transition-colors shrink-0">
              {guideOpen ? '−' : '+'}
            </span>
          </button>

          {!guideOpen && (
            <p className="mt-3 font-serif italic text-[13px] text-ink-500 leading-relaxed">
              {platform === 'wechat'
                ? '你现在在微信里, KEY 加到桌面需要 3 步. 点开看 →'
                : platform === 'ios'
                ? 'iOS · 分享 → 添加到主屏幕, 3 步搞定.'
                : platform === 'android'
                ? '安卓 · 菜单 → 添加到主屏幕, 3 步搞定.'
                : '微信打开的 / iOS / 安卓 都给了步骤. 点开看 →'}
            </p>
          )}

          {guideOpen && (
            <div className="mt-6 space-y-6">
              {/* 微信单独警告 · 国内最大坑 */}
              {platform === 'wechat' && (
                <div className="p-4 border-l-2 border-ember bg-paper-50">
                  <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ember mb-2">
                    · 你现在在微信里 ·
                  </p>
                  <p className="font-serif text-[14px] text-ink-700 leading-relaxed">
                    微信浏览器**没法直接添加到主屏幕**.
                    必须先点右上角 <span className="font-mono">⋯</span> →
                    "在 Safari 中打开" (iOS) / "在浏览器中打开" (安卓), 再按下面的步骤.
                  </p>
                </div>
              )}

              {/* Tab · iOS / 安卓 */}
              <div className="flex gap-1 border-b border-paper-300">
                <button
                  type="button"
                  onClick={() => setActiveTab('ios')}
                  className={`px-4 py-2 font-sans text-[12px] uppercase tracking-widest transition-colors ${
                    activeTab === 'ios'
                      ? 'text-ink-900 border-b-2 border-seal-500 -mb-px'
                      : 'text-ink-400 hover:text-ink-700'
                  }`}
                >
                  iPhone / iPad
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('android')}
                  className={`px-4 py-2 font-sans text-[12px] uppercase tracking-widest transition-colors ${
                    activeTab === 'android'
                      ? 'text-ink-900 border-b-2 border-seal-500 -mb-px'
                      : 'text-ink-400 hover:text-ink-700'
                  }`}
                >
                  安卓 Android
                </button>
              </div>

              {/* iOS · 3 步 */}
              {activeTab === 'ios' && (
                <ol className="space-y-5 font-serif text-[14px] text-ink-700 leading-relaxed">
                  <li className="flex gap-4">
                    <span className="font-mono text-[11px] text-seal-500 shrink-0 w-7 h-7 border border-seal-500/40 rounded-full flex items-center justify-center">1</span>
                    <div>
                      <p>
                        在 <strong className="text-ink-900">Safari</strong> 里打开 keypoint.life.
                        <span className="block font-serif italic text-[13px] text-ink-500 mt-1">
                          (如果你现在在微信里, 先点右上角 <span className="font-mono">⋯</span> → "在 Safari 中打开")
                        </span>
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="font-mono text-[11px] text-seal-500 shrink-0 w-7 h-7 border border-seal-500/40 rounded-full flex items-center justify-center">2</span>
                    <div>
                      <p>
                        点屏幕**底部中间**的 <strong className="text-ink-900">分享图标</strong>
                        <span className="inline-block ml-2 px-2 py-0.5 bg-paper-200 font-mono text-[12px] rounded-sm">↑</span>
                        (一个方框+向上箭头).
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="font-mono text-[11px] text-seal-500 shrink-0 w-7 h-7 border border-seal-500/40 rounded-full flex items-center justify-center">3</span>
                    <div>
                      <p>
                        在弹出菜单里**往下滑**, 找到 <strong className="text-ink-900">"添加到主屏幕"</strong> → 点 "添加".
                      </p>
                      <p className="font-serif italic text-[13px] text-ink-500 mt-2">
                        桌面会出现 KEY 图标 — 像 App 一样, 点开全屏, 没浏览器地址栏.
                      </p>
                    </div>
                  </li>
                </ol>
              )}

              {/* 安卓 · 3 步 */}
              {activeTab === 'android' && (
                <ol className="space-y-5 font-serif text-[14px] text-ink-700 leading-relaxed">
                  <li className="flex gap-4">
                    <span className="font-mono text-[11px] text-seal-500 shrink-0 w-7 h-7 border border-seal-500/40 rounded-full flex items-center justify-center">1</span>
                    <div>
                      <p>
                        在 <strong className="text-ink-900">Chrome / 浏览器</strong> 里打开 keypoint.life.
                        <span className="block font-serif italic text-[13px] text-ink-500 mt-1">
                          (如果你现在在微信里, 先点右上角 <span className="font-mono">⋯</span> → "在浏览器中打开")
                        </span>
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="font-mono text-[11px] text-seal-500 shrink-0 w-7 h-7 border border-seal-500/40 rounded-full flex items-center justify-center">2</span>
                    <div>
                      <p>
                        点屏幕右上角 <strong className="text-ink-900">⋮ (三点菜单)</strong>.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="font-mono text-[11px] text-seal-500 shrink-0 w-7 h-7 border border-seal-500/40 rounded-full flex items-center justify-center">3</span>
                    <div>
                      <p>
                        选 <strong className="text-ink-900">"添加到主屏幕"</strong>
                        (或 "安装应用" / "Install app") → 确认.
                      </p>
                      <p className="font-serif italic text-[13px] text-ink-500 mt-2">
                        桌面会出现 KEY 图标 — 像 App 一样, 点开全屏, 没浏览器地址栏.
                      </p>
                    </div>
                  </li>
                </ol>
              )}

              <p className="pt-4 border-t border-paper-200 font-serif italic text-[13px] text-ink-500 leading-relaxed">
                这一步可选 — 不加也能用. 但加了你以后只要点一下桌面图标就能进 KEY,
                不用翻浏览器/微信记录. 30 / 90 / 365 天后 KEY 也能直接弹通知提醒你回访.
              </p>
            </div>
          )}
        </section>

        <footer className="pt-16 text-center font-mono text-[10px] uppercase tracking-widest text-ink-400">
          keypoint.life · 你的档案存在 Turso · 永不进训练数据
        </footer>
      </main>
    </div>
  );
}
