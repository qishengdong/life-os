/**
 * /your-pattern · 决策人格画像页 · onboarding 完成的兑现
 *
 * 流程:
 *   1. 进页 GET /api/personality 看是否已生成
 *   2. 没生成 → POST 生成 (15-25s · 显示进度)
 *   3. 生成完展示: type / headline / 3 signatures / blind spot / growth direction
 *   4. 底部 CTA: → /brain (完整档案) · → /decisions/new (写第一份决定)
 *
 * 5/18 ship · 用户拍 "onboarding 完了必须有 payoff".
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';
import KeyHeader from '@/components/KeyHeader';

const TYPE_META: Record<string, { name: string; nameEn: string; anchor: string }> = {
  foundation:   { name: '奠基者', nameEn: 'Foundation',   anchor: '价值' },
  cartographer: { name: '制图者', nameEn: 'Cartographer', anchor: '路径' },
  connector:    { name: '织网者', nameEn: 'Connector',    anchor: '关系' },
  adaptor:      { name: '应变者', nameEn: 'Adaptor',      anchor: '当下' },
  contrarian:   { name: '逆行者', nameEn: 'Contrarian',   anchor: '异见' },
  integrator:   { name: '整合者', nameEn: 'Integrator',   anchor: '综合' },
};

interface Personality {
  type: string;
  headline: string;
  signatures: Array<{ pattern: string; evidence: string; sourceStage: string }>;
  blindSpot: { description: string; evidence: string };
  growthDirection: { towardType: string; description: string };
  generatedAt: number;
  basedOnStages: string[];
  llmModel: string;
}

export default function YourPatternPage() {
  const [userUid, setUserUid] = useState<string | null>(null);
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progressLabel, setProgressLabel] = useState('正在阅读你的建档答案 ...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const uid = getOrCreateClientUid();
    setUserUid(uid);
    loadPersonality(uid);
  }, []);

  // Progress label rotation
  useEffect(() => {
    if (!generating) return;
    const stages = [
      { ms: 0, label: '正在阅读你的建档答案 ...' },
      { ms: 4000, label: '识别你的决策锚 (价值 / 关系 / 路径 / ...) ...' },
      { ms: 10000, label: '综合 6 stage 答案, 抽取决策签名 ...' },
      { ms: 18000, label: '反幻觉检查 · 每个判断必须 ground ...' },
    ];
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const cur = [...stages].reverse().find((s) => elapsed >= s.ms);
      if (cur) setProgressLabel(cur.label);
    }, 500);
    return () => clearInterval(interval);
  }, [generating]);

  async function loadPersonality(uid: string) {
    try {
      const res = await fetch('/api/personality', { headers: { [UID_HEADER]: uid } });
      const data = await res.json();
      if (data.personality) {
        setPersonality(data.personality);
      } else {
        // 没生成 · 自动触发生成
        await generate(uid);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function generate(uid: string) {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/personality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [UID_HEADER]: uid },
      });
      // Vercel timeout 容错 (5/18 hotfix doctrine)
      if (res.status >= 500 || !res.headers.get('content-type')?.includes('application/json')) {
        setError(
          `生成超时或服务器错 (${res.status}). 后台可能仍在跑, 30 秒后刷新本页. 仍空白 → 联系管理员.`,
        );
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '生成失败');
        return;
      }
      setPersonality(data.personality);
    } catch (e: any) {
      setError(e.message || '网络错误');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <KeyHeader current="your-pattern" />

      <main className="max-w-prose-lg mx-auto px-6 pb-24">
        <header className="pt-10 pb-12 text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
            · 你的决策画像 · 9 分钟建档的兑现 ·
          </p>
          <h1 className="font-serif text-editorial-lg text-ink-900 tracking-tightish leading-tight mb-6">
            这是 KEY 第一次, 把你看清楚.
          </h1>
          <p className="font-serif italic text-reading text-ink-500 max-w-prose-md mx-auto leading-relaxed">
            不是评价, 没有对错. 是描述 — 你做决策时的习惯锚点 / 反复出现的签名 / 可能没看到的角. <br />
            这页**会变** — 随你跟 KEY 做更多决策, 它自动重写.
          </p>
        </header>

        {/* 加载中 / 生成中 */}
        {(loading || generating) && (
          <div className="my-20 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-4 border-l-2 border-seal-500 bg-paper-50">
              <div className="w-2 h-2 bg-seal-500 rounded-full animate-pulse" />
              <p className="font-serif italic text-ink-700">{progressLabel}</p>
            </div>
            {generating && (
              <p className="font-mono text-[11px] text-ink-400 mt-4">
                ~15-25 秒. 同步等待, 别关页.
              </p>
            )}
          </div>
        )}

        {/* 错误 */}
        {error && !loading && !generating && (
          <div className="my-12 p-6 border-l-2 border-ember bg-paper-100">
            <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-ember mb-2">错误</p>
            <p className="font-serif text-sm text-ink-700 mb-4">{error}</p>
            {userUid && (
              <button
                onClick={() => generate(userUid)}
                className="px-5 py-2 font-serif text-sm text-paper bg-ink-900 hover:bg-seal-500 transition-colors"
              >
                重试生成 →
              </button>
            )}
          </div>
        )}

        {/* 画像展示 */}
        {personality && !loading && !generating && (
          <article className="space-y-12">
            {/* 主型 hero */}
            <section className="border-y border-paper-300 py-10 text-center">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
                · 你的当前决策型 ·
              </p>
              <h2 className="font-serif text-editorial-xl text-ink-900 tracking-tighter mb-3">
                {TYPE_META[personality.type]?.name || personality.type}
              </h2>
              <p className="font-mono text-[11px] text-ink-400 uppercase tracking-widest mb-6">
                {TYPE_META[personality.type]?.nameEn} · 决策锚 = {TYPE_META[personality.type]?.anchor}
              </p>
              <p className="font-serif italic text-reading text-ink-700 editorial-leading max-w-prose-md mx-auto">
                {personality.headline}
              </p>
            </section>

            {/* 3 个签名 */}
            <section>
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6 text-center">
                · 你的 3 个决策签名 ·
              </p>
              <div className="space-y-8">
                {personality.signatures.map((sig, i) => (
                  <div key={i} className="border-l-2 border-seal-500/40 pl-6">
                    <p className="font-serif text-base text-ink-900 mb-3 leading-relaxed">
                      <span className="font-mono text-[11px] text-seal-500 mr-2">{i + 1}.</span>
                      {sig.pattern}
                    </p>
                    <p className="font-serif italic text-[14px] text-ink-500 leading-relaxed">
                      你在 <span className="font-mono text-ink-400">{sig.sourceStage}</span> 阶段写过:
                      <br />
                      <span className="text-ink-700">&ldquo;{sig.evidence}&rdquo;</span>
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 盲点 */}
            <section className="border-t border-paper-300 pt-10">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ember mb-6 text-center">
                · 可能没看到的 ·
              </p>
              <div className="border-l-2 border-ember/40 pl-6">
                <p className="font-serif text-reading text-ink-700 editorial-leading mb-3">
                  {personality.blindSpot.description}
                </p>
                {personality.blindSpot.evidence && (
                  <p className="font-serif italic text-[13px] text-ink-500">
                    据你写过: &ldquo;{personality.blindSpot.evidence}&rdquo;
                  </p>
                )}
              </div>
            </section>

            {/* 进化方向 */}
            <section className="border-t border-paper-300 pt-10">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6 text-center">
                · 进化方向 ·
              </p>
              <div className="text-center mb-6">
                <span className="font-serif text-[15px] text-ink-500">
                  {TYPE_META[personality.type]?.name}
                </span>
                <span className="font-mono text-ink-400 mx-3">→</span>
                <span className="font-serif text-[15px] text-seal-500">
                  {TYPE_META[personality.growthDirection.towardType]?.name || personality.growthDirection.towardType}
                </span>
              </div>
              <p className="font-serif text-reading text-ink-700 editorial-leading text-center max-w-prose-md mx-auto">
                {personality.growthDirection.description}
              </p>
            </section>

            {/* footer · meta + 2 CTA */}
            <footer className="border-t border-paper-300 pt-10 text-center space-y-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-400">
                生成于 {new Date(personality.generatedAt * 1000).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                {' · '}基于 {personality.basedOnStages.length} 个建档 stage
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/brain"
                  className="px-8 py-3 font-serif text-base text-paper bg-ink-900 hover:bg-seal-500 transition-colors"
                >
                  看你的档案 →
                </Link>
                <Link
                  href="/decisions/new"
                  className="px-8 py-3 font-serif text-base text-ink-900 border-2 border-ink-900 hover:bg-paper-100 transition-colors"
                >
                  开始你的第一份决定 →
                </Link>
              </div>

              <p className="font-serif italic text-[12px] text-ink-400 max-w-prose-md mx-auto">
                想重新生成 (改了 onboarding 答案后)? <button onClick={() => userUid && generate(userUid)} className="underline hover:text-seal-500">点这里 ↻</button>
              </p>
            </footer>
          </article>
        )}
      </main>
    </div>
  );
}
