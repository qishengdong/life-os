/**
 * /admin/qa · AI Native Test v3 仪表盘 · 客户端 orchestrator
 *
 * 因 Vercel Hobby 60s 上限, decision stage 一次跑 1 个 (~42s).
 * 客户端 loop 40 个 scenario, 实时显示进度 + 结果.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Scenario {
  id: string;
  trap: string;
  stage: string;
  personaId: string;
  expectedBehavior: string;
}

interface ResultRow {
  scenarioId: string;
  personaId: string;
  trapType: string;
  stage: string;
  status: 'pending' | 'running' | 'pass' | 'fail' | 'skipped' | 'error';
  layerAFails?: Array<{ reason: string; matched?: string; detail?: string }>;
  layerCFocusAvg?: number;
  layerCComment?: string;
  aiOutput?: string;
  durationMs?: number;
  errorMessage?: string;
}

function fmtTime(unix: number): string {
  const d = new Date(unix);
  return `${d.getMinutes()}:${String(d.getSeconds()).padStart(2, '0')}`;
}

export default function QaPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [me, setMe] = useState<{ displayName: string } | null>(null);
  const [stopRequested, setStopRequested] = useState(false);
  const [mode, setMode] = useState<'layer_a_only' | 'layer_ac'>('layer_a_only');

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => {
        if (r.status === 401) {
          window.location.href = '/admin/login?from=/admin/qa';
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d?.authed) setMe(d.user);
      })
      .catch(() => {});

    fetch('/api/admin/qa/scenarios')
      .then((r) => r.json())
      .then((d) => setScenarios(d.scenarios || []))
      .catch(() => {});
  }, []);

  async function runOne(scenario: Scenario, modeArg: 'layer_a_only' | 'layer_ac'): Promise<ResultRow> {
    const start = Date.now();
    // decision stage + layer_ac → 2-pass · 单次会 timeout (~42s gen + 15s judge > 60s Vercel)
    // 先 layer_a_only 拿 aiOutput, 再单独 hit /api/admin/qa/layer-c 复用 cached output.
    const need2Pass = scenario.stage === 'decision' && modeArg === 'layer_ac';
    const pass1Mode = need2Pass ? 'layer_a_only' : modeArg;

    try {
      const res = await fetch('/api/admin/qa/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: pass1Mode,
          label: 'orchestrator',
          filterScenarioIds: [scenario.id],
        }),
      });
      if (!res.ok) {
        return {
          scenarioId: scenario.id,
          personaId: scenario.personaId,
          trapType: scenario.trap,
          stage: scenario.stage,
          status: 'error',
          errorMessage: `HTTP ${res.status}`,
          durationMs: Date.now() - start,
        };
      }
      const data = await res.json();
      const r = data.summary?.results?.[0];
      if (!r) {
        return {
          scenarioId: scenario.id,
          personaId: scenario.personaId,
          trapType: scenario.trap,
          stage: scenario.stage,
          status: 'error',
          errorMessage: 'no result',
          durationMs: Date.now() - start,
        };
      }

      const row: ResultRow = {
        scenarioId: r.scenarioId,
        personaId: r.personaId,
        trapType: r.trapType,
        stage: r.stage,
        status: r.status,
        layerAFails: r.layerAFails,
        layerCFocusAvg: r.layerCFocusAvg,
        layerCComment: r.layerCComment,
        aiOutput: r.aiOutput,
        durationMs: Date.now() - start,
      };

      // Pass 2 · decision stage 单独 hit Layer C
      if (need2Pass && row.aiOutput && row.aiOutput.length > 500 && r.status !== 'skipped') {
        try {
          const cRes = await fetch('/api/admin/qa/layer-c', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scenarioId: scenario.id, aiOutput: row.aiOutput }),
          });
          if (cRes.ok) {
            const cData = await cRes.json();
            if (cData.success) {
              row.layerCFocusAvg = cData.focusAvg;
              row.layerCComment = cData.comment;
              // 真 pass = Layer A pass 且 Layer C pass
              const layerAPass = r.status === 'pass';
              row.status = layerAPass && cData.pass ? 'pass' : 'fail';
            }
          }
        } catch {
          // Layer C 失败不阻 row · 保留 Layer A 结果
        }
        row.durationMs = Date.now() - start;
      }

      return row;
    } catch (e: any) {
      return {
        scenarioId: scenario.id,
        personaId: scenario.personaId,
        trapType: scenario.trap,
        stage: scenario.stage,
        status: 'error',
        errorMessage: e.message,
        durationMs: Date.now() - start,
      };
    }
  }

  async function runBatch(filter?: { stage?: string; trap?: string }) {
    setRunning(true);
    setStopRequested(false);
    let list = scenarios;
    if (filter?.stage) list = list.filter((s) => s.stage === filter.stage);
    if (filter?.trap) list = list.filter((s) => s.trap === filter.trap);

    // 初始化 pending rows
    const initial: ResultRow[] = list.map((s) => ({
      scenarioId: s.id,
      personaId: s.personaId,
      trapType: s.trap,
      stage: s.stage,
      status: 'pending',
    }));
    setResults(initial);
    setProgress({ current: 0, total: list.length });

    for (let i = 0; i < list.length; i++) {
      if (stopRequested) break;
      const s = list[i];
      // mark running
      setResults((prev) =>
        prev.map((r) => (r.scenarioId === s.id ? { ...r, status: 'running' } : r)),
      );
      const result = await runOne(s, mode);
      setResults((prev) => prev.map((r) => (r.scenarioId === s.id ? result : r)));
      setProgress({ current: i + 1, total: list.length });
    }

    setRunning(false);
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  const stats = {
    pass: results.filter((r) => r.status === 'pass').length,
    fail: results.filter((r) => r.status === 'fail').length,
    skipped: results.filter((r) => r.status === 'skipped').length,
    error: results.filter((r) => r.status === 'error').length,
    realRuns: results.filter((r) => r.status === 'pass' || r.status === 'fail').length,
  };

  const totalDuration = results.reduce((s, r) => s + (r.durationMs || 0), 0);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <header className="bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg md:text-xl font-serif text-stone-900">AI Native QA · v3 仪表盘</h1>
            {me && <p className="text-xs text-stone-500">{me.displayName}</p>}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-xs font-mono uppercase tracking-widest text-stone-500 hover:text-stone-900">
              ← Admin
            </Link>
            <button onClick={logout} className="text-xs font-mono uppercase tracking-widest text-stone-400 hover:text-red-700">
              退出
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Triggers */}
        <section className="bg-white rounded-md border border-stone-200 p-6 shadow-sm">
          <h2 className="font-serif text-xl text-stone-900 mb-2">触发 battery</h2>
          <p className="text-sm text-stone-500 mb-5 leading-relaxed">
            Vercel Hobby 60s 上限 → 客户端 orchestrator 每次跑 1 个 case.
            <br />
            Decision ~42s + (Layer C +15s, 2-pass), pulse/letter/outcome 直接跑.
            全 40 在 layer_ac 模式约 <strong>20 分钟</strong>. 中间可点 "停止".
            <br />
            onboarding 5 个为 stub (brain seed 已替代下游效果), 立即 skipped.
          </p>
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <label className="text-sm text-stone-700">
              Mode:
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="ml-2 px-3 py-1 border border-stone-300 rounded bg-white text-sm"
                disabled={running}
              >
                <option value="layer_a_only">Layer A only (0 token)</option>
                <option value="layer_ac">Layer A + C LLM judge (~3000 token)</option>
              </select>
            </label>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => runBatch()}
              disabled={running}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-700 text-white text-sm rounded disabled:opacity-30 transition-colors"
            >
              {running ? '运行中...' : '跑全 40'}
            </button>
            <button
              onClick={() => runBatch({ stage: 'decision' })}
              disabled={running}
              className="px-5 py-2.5 border-2 border-stone-900 text-stone-900 hover:bg-stone-100 text-sm rounded disabled:opacity-30 transition-colors"
            >
              decision 21 个 (~15 分钟)
            </button>
            <button
              onClick={() => setStopRequested(true)}
              disabled={!running}
              className="px-5 py-2.5 border-2 border-red-700 text-red-700 hover:bg-red-50 text-sm rounded disabled:opacity-30 transition-colors"
            >
              停止
            </button>
          </div>
          {running && (
            <div className="mt-5 pt-5 border-t border-stone-200">
              <p className="font-mono text-sm text-stone-700 mb-2">
                进度: {progress.current}/{progress.total}
              </p>
              <div className="h-2 bg-stone-100 rounded overflow-hidden">
                <div
                  className="h-full bg-stone-900 transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </section>

        {/* Stats */}
        {results.length > 0 && (
          <section className="bg-white rounded-md border border-stone-200 p-6 shadow-sm">
            <h2 className="font-serif text-xl text-stone-900 mb-3">本次统计</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Stat label="✓ Pass" value={stats.pass} color="text-green-700" />
              <Stat label="✗ Fail" value={stats.fail} color="text-red-700" />
              <Stat label="◯ Skipped (stub)" value={stats.skipped} color="text-stone-400" />
              <Stat label="⚠ Error" value={stats.error} color="text-amber-700" />
              <Stat
                label="真通过率"
                value={
                  stats.realRuns > 0
                    ? `${Math.round((100 * stats.pass) / stats.realRuns)}%`
                    : '—'
                }
                color="text-stone-900"
              />
            </div>
            <p className="text-xs font-mono text-stone-400 mt-4">
              总耗时 {(totalDuration / 1000).toFixed(1)}s
            </p>
          </section>
        )}

        {/* Results */}
        {results.length > 0 && (
          <section className="bg-white rounded-md border border-stone-200 p-6 shadow-sm">
            <h2 className="font-serif text-xl text-stone-900 mb-4">
              结果 ({results.length} cases)
            </h2>
            <div className="space-y-2">
              {results.map((r) => (
                <ResultCard key={r.scenarioId} result={r} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div>
      <p className="text-xs font-mono uppercase tracking-widest text-stone-500 mb-1">{label}</p>
      <p className={`font-serif text-2xl ${color}`}>{value}</p>
    </div>
  );
}

function ResultCard({ result: r }: { result: ResultRow }) {
  const isOpen = useState(false);
  const [open, setOpen] = useState(false);

  const statusBadge = {
    pending: { label: '...', color: 'bg-stone-100 text-stone-400' },
    running: { label: '运行中', color: 'bg-blue-100 text-blue-700' },
    pass: { label: '✓', color: 'bg-green-100 text-green-700' },
    fail: { label: '✗', color: 'bg-red-100 text-red-700' },
    skipped: { label: '◯ skip', color: 'bg-stone-100 text-stone-400' },
    error: { label: '⚠', color: 'bg-amber-100 text-amber-700' },
  }[r.status];

  return (
    <div className={`border rounded ${r.status === 'fail' ? 'border-red-200' : 'border-stone-200'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-stone-50"
      >
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <span className={`px-2 py-0.5 rounded text-xs font-mono ${statusBadge.color}`}>
            {statusBadge.label}
          </span>
          <span className="font-mono text-xs text-stone-700">{r.scenarioId}</span>
          <span className="text-xs text-stone-500">
            {r.trapType.replace(/_/g, ' ')} · {r.stage}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-stone-500 shrink-0">
          {r.durationMs ? `${(r.durationMs / 1000).toFixed(1)}s` : ''}
          {r.layerCFocusAvg !== undefined && (
            <span className={r.layerCFocusAvg >= 3.5 ? 'text-green-700' : 'text-amber-700'}>
              C: {r.layerCFocusAvg.toFixed(2)}/5
            </span>
          )}
          <span className="text-stone-400">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-stone-100 text-sm space-y-3">
          {r.layerAFails && r.layerAFails.length > 0 && (
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-red-700 mb-1">
                Layer A 失败
              </p>
              <ul className="text-xs space-y-0.5">
                {r.layerAFails.map((f, i) => (
                  <li key={i} className="text-red-700">
                    · {f.reason}
                    {f.matched && `: "${f.matched}"`}
                    {f.detail && ` (${f.detail})`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {r.layerCComment && (
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-stone-500 mb-1">
                Layer C 总评
              </p>
              <p className="text-stone-700 leading-relaxed whitespace-pre-line">{r.layerCComment}</p>
            </div>
          )}
          {r.errorMessage && (
            <p className="font-mono text-xs text-amber-700">Error: {r.errorMessage}</p>
          )}
          {r.aiOutput && (
            <details>
              <summary className="cursor-pointer font-mono text-xs uppercase tracking-widest text-stone-500">
                AI 输出 ({r.aiOutput.length} 字, 点开)
              </summary>
              <pre className="text-xs bg-stone-50 p-3 rounded overflow-x-auto whitespace-pre-wrap mt-2 max-h-96 overflow-y-auto">
                {r.aiOutput}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
