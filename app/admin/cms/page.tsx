/**
 * /admin/cms — CMS 首页 · 列出所有可编辑板块
 *
 * 视觉: 跟 /admin 一致, 黑底白字工具感.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CmsSection {
  id: string;
  label: string;
  description: string;
  href: string;
  scope: string;
}

const SECTIONS: CmsSection[] = [
  {
    id: 'home-hero',
    label: 'Hero · Brand Statement + Explainer',
    description: 'KEY 首页第一屏: brand statement 中英 / sub-tag / explainer 4 段 / CTAs / Better Call KEY',
    href: '/admin/cms/home/hero',
    scope: 'app/page.tsx',
  },
  {
    id: 'home-leads',
    label: 'Hero · 4 个 Lead (痛点入口)',
    description: '· 自我 · 子女 · 父母 · 转身 — 每条 label / setup / truth, 可加/删/重排',
    href: '/admin/cms/home/leads',
    scope: 'app/page.tsx',
  },
  {
    id: 'home-five-domains',
    label: '五类决策板块',
    description: '父母养老 / 子女出路 / 婚姻去留 / 职业转身 / 迁移决策 — 中英文 + note',
    href: '/admin/cms/home/five-domains',
    scope: 'app/page.tsx',
  },
  {
    id: 'home-footer',
    label: 'Footer · 落款 + Nav',
    description: '落款 / AIGC 备注 / 顶 nav 链接 (排序 + emphasis)',
    href: '/admin/cms/home/footer',
    scope: 'app/page.tsx',
  },
  // V1 暂未抽取 — 后续 Day 2 加
  // 'methodology', 'membership', 'sample-brief teaser', 'onboarding letter'
];

export default function CmsHomePage() {
  const [publishStatus, setPublishStatus] = useState<{
    lastPublishedAt?: string;
    githubTokenConfigured?: boolean;
  }>({});
  const [me, setMe] = useState<{
    displayName: string;
    username: string;
    role: 'owner' | 'editor';
  } | null>(null);

  useEffect(() => {
    fetch('/api/admin/cms/status')
      .then((r) => {
        if (r.status === 401) {
          window.location.href = '/admin/login?from=/admin/cms';
          return null;
        }
        return r.json();
      })
      .then((d) => d && setPublishStatus(d))
      .catch(() => {});

    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.authed) setMe(d.user);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-ink-900 text-paper-50 p-6 md:p-10">
      <header className="flex justify-between items-baseline mb-12 flex-wrap gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-1">
            KEY · Admin · CMS
          </p>
          <h1 className="font-serif text-3xl text-paper-50">内容编辑器</h1>
          {me && (
            <p className="font-mono text-[11px] text-paper-300/60 mt-1">
              登录: {me.displayName} <span className="text-paper-300/40">({me.username}, {me.role})</span>
            </p>
          )}
        </div>
        <div className="flex gap-4 items-baseline flex-wrap">
          {me?.role === 'owner' && (
            <Link
              href="/admin/users"
              className="font-mono text-xs uppercase tracking-widest text-seal-400 hover:text-paper-50 transition-colors"
            >
              Users →
            </Link>
          )}
          <Link
            href="/admin"
            className="font-mono text-xs uppercase tracking-widest text-seal-400 hover:text-paper-50 transition-colors"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* GitHub token 状态 */}
      <div className="mb-10 border border-paper-300/20 p-4 rounded-sm">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper-300/60 mb-2">
          GITHUB INTEGRATION
        </p>
        {publishStatus.githubTokenConfigured ? (
          <p className="font-mono text-xs text-sage">
            ✓ GitHub token 已配置 · 发布按钮可用
          </p>
        ) : (
          <div className="text-sm">
            <p className="font-mono text-amber mb-1">
              ⚠ GitHub token 未配置 · 编辑可以但发布按钮会失败
            </p>
            <p className="font-mono text-[11px] text-paper-300/60">
              到 Vercel project env vars 加 <code className="bg-ink-700 px-1.5 py-0.5 rounded">GITHUB_TOKEN</code>
              {' '}(fine-grained, contents:read+write, repo: qishengdong/life-os)
            </p>
          </div>
        )}
        {publishStatus.lastPublishedAt && (
          <p className="font-mono text-[11px] text-paper-300/60 mt-2">
            上次发布: {new Date(publishStatus.lastPublishedAt).toLocaleString('zh-CN')}
          </p>
        )}
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-4">
        SECTIONS
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTIONS.map((s) => (
          <Link
            key={s.id}
            href={s.href}
            className="block border border-paper-300/20 hover:border-seal-400 hover:bg-ink-700/30 p-5 transition-colors group"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-seal-400 mb-1">
              {s.id}
            </p>
            <h3 className="font-serif text-lg text-paper-50 group-hover:text-seal-200 mb-2">
              {s.label}
            </h3>
            <p className="font-sans text-[12px] text-paper-300/70 leading-relaxed mb-2">
              {s.description}
            </p>
            <p className="font-mono text-[10px] text-paper-300/40">
              source: {s.scope}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-12 border-t border-paper-300/10 pt-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper-300/40 mb-2">
          NOT YET EDITABLE
        </p>
        <p className="font-mono text-[11px] text-paper-300/40">
          methodology · membership · sample-brief · onboarding letter · voice spec
          <br />
          (Day 2 sprint 加 — 现在改还需要找开发)
        </p>
      </div>
    </div>
  );
}
