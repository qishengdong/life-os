/**
 * /admin/cms — 多 tab CMS · 一页改所有网站文案
 *
 * Tabs: 首页 · 方法论 · 样品 · 会员 · 价格 · 透明度 · 关于 · 条款 · 隐私
 * 每个 tab 是一个独立编辑器, 各自的"保存并更新网站"按钮.
 */

'use client';

import { useEffect, useState } from 'react';
import HomeEditor from './_editors/HomeEditor';
import MethodologyEditor from './_editors/MethodologyEditor';

// ============================================================================
// Page registry — 加新页就在这里加一行
// ============================================================================

interface CmsTab {
  key: string;
  label: string;
  hint: string;
  component: React.ComponentType;
  status: 'ready' | 'coming';
}

const TABS: CmsTab[] = [
  { key: 'home', label: '首页', hint: '/', component: HomeEditor, status: 'ready' },
  {
    key: 'methodology',
    label: '方法论',
    hint: '/methodology',
    component: MethodologyEditor,
    status: 'ready',
  },
  {
    key: 'sample-brief',
    label: '样品',
    hint: '/sample-brief',
    component: () => <ComingSoon page="样品 brief" />,
    status: 'coming',
  },
  {
    key: 'membership',
    label: '会员',
    hint: '/membership',
    component: () => <ComingSoon page="会员" />,
    status: 'coming',
  },
  {
    key: 'pricing',
    label: '价格',
    hint: '/pricing',
    component: () => <ComingSoon page="价格" />,
    status: 'coming',
  },
  {
    key: 'transparency',
    label: '透明度',
    hint: '/transparency',
    component: () => <ComingSoon page="透明度" />,
    status: 'coming',
  },
  {
    key: 'about',
    label: '关于',
    hint: '/about',
    component: () => <ComingSoon page="关于" />,
    status: 'coming',
  },
  {
    key: 'terms',
    label: '服务条款',
    hint: '/terms',
    component: () => <ComingSoon page="服务条款" />,
    status: 'coming',
  },
  {
    key: 'privacy',
    label: '隐私',
    hint: '/privacy',
    component: () => <ComingSoon page="隐私" />,
    status: 'coming',
  },
];

// ============================================================================
// Coming-soon placeholder
// ============================================================================

function ComingSoon({ page }: { page: string }) {
  return (
    <div className="bg-white rounded-md border border-stone-200 p-10 text-center shadow-sm">
      <p className="text-stone-500 mb-3">这个页面的 CMS 编辑器还在做.</p>
      <p className="text-sm text-stone-400">
        {page} · 下一轮 ship. 同期你想改这页的字, 直接告诉我哪段改成什么, 我代你直接改.
      </p>
    </div>
  );
}

// ============================================================================
// Main page
// ============================================================================

export default function CmsPage() {
  const [activeKey, setActiveKey] = useState<string>('home');
  const [me, setMe] = useState<{ displayName: string; username: string; role: string } | null>(
    null,
  );

  useEffect(() => {
    // restore last tab from URL hash
    const hash = window.location.hash.replace('#', '');
    if (hash && TABS.find((t) => t.key === hash)) {
      setActiveKey(hash);
    }
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => {
        if (d?.authed) setMe(d.user);
      })
      .catch(() => {});
  }, []);

  function switchTab(key: string) {
    setActiveKey(key);
    window.location.hash = key;
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  const ActiveEditor = TABS.find((t) => t.key === activeKey)?.component || HomeEditor;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      {/* === Top sticky bar === */}
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg md:text-xl font-serif text-stone-900">
              改 KEY 网站文案
            </h1>
            {me && (
              <p className="text-xs text-stone-500">
                {me.displayName} ({me.role})
              </p>
            )}
          </div>
          <button
            onClick={logout}
            className="text-xs text-stone-400 hover:text-stone-700"
          >
            退出
          </button>
        </div>

        {/* === Tab strip === */}
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <nav className="flex gap-1 overflow-x-auto -mb-px">
            {TABS.map((t) => {
              const isActive = t.key === activeKey;
              return (
                <button
                  key={t.key}
                  onClick={() => switchTab(t.key)}
                  className={`relative px-4 py-2.5 text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? 'text-stone-900 border-b-2 border-stone-900 font-medium'
                      : 'text-stone-500 hover:text-stone-900 border-b-2 border-transparent'
                  }`}
                  title={t.hint}
                >
                  {t.label}
                  {t.status === 'coming' && (
                    <span className="ml-1.5 text-[10px] text-amber-700">●</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* === Body === */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <ActiveEditor />
      </main>

      <p className="text-xs text-stone-400 text-center mb-8">
        KEY · Admin · CMS · 改完点保存, 2-3 分钟生效 ·{' '}
        <span className="text-amber-700">●</span> = 还没做好
      </p>
    </div>
  );
}
