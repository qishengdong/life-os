/**
 * /admin/qa · AI Native Test v3 仪表盘
 *
 * 列最近 runs · 失败 case 详情 · 手动触发 battery
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface RunRow {
  id: number;
  label: string;
  mode: string;
  total_cases: number;
  passed_a: number;
  passed_c: number;
  tokens_used: number;
  duration_ms: number | null;
  created_at: number;
}

interface ResultRow {
  id: number;
  scenario_id: string;
  persona_id: string;
  trap_type: string;
  stage: string;
  layer_a_pass: number;
  layer_a_fails: string;
  layer_c_pass: number | null;
  layer_c_focus_avg: number | null;
  layer_c_overall_avg: number | null;
  layer_c_comment: string | null;
  ai_output: string | null;
  created_at: number;
}

function fmtDate(unix: number): string {
  const d = new Date(unix * 1000);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function QaPage() {
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<{ displayName: string } | null>(null);

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
    loadRuns();
  }, []);

  async function loadRuns() {
    const res = await fetch('/api/admin/qa/runs');
    if (res.status === 401) {
      window.location.href = '/admin/login?from=/admin/qa';
      return;
    }
    const data = await res.json();
    setRuns(data.runs || []);
  }

  async function loadRunDetail(runId: number) {
    setSelectedRunId(runId);
    const res = await fetch(`/api/admin/qa/runs?runId=${runId}`);
    const data = await res.json();
    setResults(data.results || []);
  }

  async function triggerRun(mode: 'layer_a_only' | 'layer_ac', sampleSize?: number) {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/qa/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, sampleSize, label: 'manual-' + mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'run failed');
      } else {
        await loadRuns();
        if (data.summary?.runId) {
          await loadRunDetail(data.summary.runId);
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <header className="bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg md:text-xl font-serif text-stone-900">AI Native QA · v3 测试仪表盘</h1>
            {me && <p className="text-xs text-stone-500">{me.displayName}</p>}
          </div>
          <Link
            href="/admin"
            className="font-mono text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900"
          >
            ← Admin
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Trigger panel */}
        <section className="bg-white rounded-md border border-stone-200 p-6 shadow-sm">
          <h2 className="font-serif text-xl text-stone-900 mb-4">触发 battery</h2>
          <p className="text-sm text-stone-500 mb-5 leading-relaxed">
            <strong>Layer A only</strong> · 全 40 scenario · 毫秒级 · 仅 deterministic 检查 · 不烧 token.
            <br />
            <strong>Layer A+C 抽样</strong> · 抽 10 个 scenario, 跑 Layer A + LLM judge · token cost ~3000.
            <br />
            <strong>Layer A+C 全跑</strong> · 全 40 scenario LLM judge · token cost ~12000 · 不要乱按.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => triggerRun('layer_a_only')}
              disabled={running}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-700 text-white text-sm rounded disabled:opacity-30 transition-colors"
            >
              {running ? '运行中 ...' : 'Layer A only · 全 40'}
            </button>
            <button
              onClick={() => triggerRun('layer_ac', 10)}
              disabled={running}
              className="px-5 py-2.5 border-2 border-stone-900 text-stone-900 hover:bg-stone-100 text-sm rounded disabled:opacity-30 transition-colors"
            >
              Layer A+C · 抽 10
            </button>
            <button
              onClick={() => triggerRun('layer_ac')}
              disabled={running}
              className="px-5 py-2.5 border-2 border-amber-700 text-amber-700 hover:bg-amber-50 text-sm rounded disabled:opacity-30 transition-colors"
            >
              Layer A+C · 全 40 (烧 token!)
            </button>
          </div>
          {error && <p className="text-red-700 text-sm mt-3">{error}</p>}
        </section>

        {/* Recent runs */}
        <section className="bg-white rounded-md border border-stone-200 p-6 shadow-sm">
          <h2 className="font-serif text-xl text-stone-900 mb-4">最近 runs</h2>
          {runs.length === 0 ? (
            <p className="text-stone-400 italic">还没跑过测试 — 上面点一个按钮</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-stone-200">
                  <tr className="text-left">
                    <th className="py-2 font-mono text-xs uppercase tracking-widest text-stone-500">时间</th>
                    <th className="py-2 font-mono text-xs uppercase tracking-widest text-stone-500">label</th>
                    <th className="py-2 font-mono text-xs uppercase tracking-widest text-stone-500">mode</th>
                    <th className="py-2 font-mono text-xs uppercase tracking-widest text-stone-500">cases</th>
                    <th className="py-2 font-mono text-xs uppercase tracking-widest text-stone-500">A 通过</th>
                    <th className="py-2 font-mono text-xs uppercase tracking-widest text-stone-500">C 通过</th>
                    <th className="py-2 font-mono text-xs uppercase tracking-widest text-stone-500">tokens</th>
                    <th className="py-2 font-mono text-xs uppercase tracking-widest text-stone-500">耗时</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => loadRunDetail(r.id)}
                      className={`cursor-pointer hover:bg-stone-50 border-b border-stone-100 ${
                        selectedRunId === r.id ? 'bg-amber-50' : ''
                      }`}
                    >
                      <td className="py-3 font-mono text-xs">{fmtDate(r.created_at)}</td>
                      <td className="py-3">{r.label}</td>
                      <td className="py-3 font-mono text-xs text-stone-500">{r.mode}</td>
                      <td className="py-3">{r.total_cases}</td>
                      <td className="py-3">
                        <span
                          className={
                            r.passed_a / r.total_cases >= 0.85 ? 'text-green-700' : 'text-amber-700'
                          }
                        >
                          {r.passed_a}/{r.total_cases} ({Math.round((100 * r.passed_a) / r.total_cases)}%)
                        </span>
                      </td>
                      <td className="py-3">
                        {r.mode === 'layer_a_only' ? (
                          <span className="text-stone-400">—</span>
                        ) : (
                          <span
                            className={
                              r.passed_c / r.total_cases >= 0.7 ? 'text-green-700' : 'text-amber-700'
                            }
                          >
                            {r.passed_c}/{r.total_cases}
                          </span>
                        )}
                      </td>
                      <td className="py-3 font-mono text-xs text-stone-500">
                        {r.tokens_used > 0 ? r.tokens_used.toLocaleString() : '—'}
                      </td>
                      <td className="py-3 font-mono text-xs text-stone-500">
                        {r.duration_ms ? `${(r.duration_ms / 1000).toFixed(1)}s` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Run detail */}
        {selectedRunId && results.length > 0 && (
          <section className="bg-white rounded-md border border-stone-200 p-6 shadow-sm">
            <h2 className="font-serif text-xl text-stone-900 mb-4">
              Run #{selectedRunId} 详情 ({results.length} cases)
            </h2>
            <div className="space-y-3">
              {results.map((r) => {
                const passed = r.layer_a_pass === 1 && (r.layer_c_pass === null || r.layer_c_pass === 1);
                return (
                  <details
                    key={r.id}
                    className={`border ${
                      passed ? 'border-green-200 bg-green-50/30' : 'border-amber-300 bg-amber-50/50'
                    } rounded p-4`}
                  >
                    <summary className="cursor-pointer flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-xs">{passed ? '✓' : '✗'}</span>
                        <span className="font-mono text-xs text-stone-700">{r.scenario_id}</span>
                        <span className="text-xs text-stone-500">
                          {r.trap_type} · {r.stage}
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs">
                        <span className={r.layer_a_pass === 1 ? 'text-green-700' : 'text-red-700'}>
                          A: {r.layer_a_pass === 1 ? 'pass' : 'fail'}
                        </span>
                        {r.layer_c_focus_avg !== null && (
                          <span
                            className={
                              r.layer_c_pass === 1 ? 'text-green-700' : 'text-amber-700'
                            }
                          >
                            C: {r.layer_c_focus_avg.toFixed(2)}/5
                          </span>
                        )}
                      </div>
                    </summary>
                    <div className="mt-3 pt-3 border-t border-stone-200 text-sm space-y-3">
                      {r.layer_a_pass === 0 && r.layer_a_fails && (
                        <div>
                          <p className="font-mono text-xs uppercase tracking-widest text-red-700 mb-1">
                            Layer A 失败
                          </p>
                          <pre className="text-xs bg-red-50 p-2 rounded overflow-x-auto">{r.layer_a_fails}</pre>
                        </div>
                      )}
                      {r.layer_c_comment && (
                        <div>
                          <p className="font-mono text-xs uppercase tracking-widest text-stone-500 mb-1">
                            Layer C 总评
                          </p>
                          <p className="text-stone-700 leading-relaxed whitespace-pre-line">
                            {r.layer_c_comment}
                          </p>
                        </div>
                      )}
                      {r.ai_output && (
                        <details>
                          <summary className="cursor-pointer font-mono text-xs uppercase tracking-widest text-stone-500">
                            AI 输出 (前 1000 字)
                          </summary>
                          <pre className="text-xs bg-stone-50 p-3 rounded overflow-x-auto whitespace-pre-wrap mt-2">
                            {r.ai_output.slice(0, 1000)}
                            {r.ai_output.length > 1000 && '\n\n... (truncated)'}
                          </pre>
                        </details>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
