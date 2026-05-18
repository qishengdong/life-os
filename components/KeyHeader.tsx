/**
 * KeyHeader · 统一头部 nav · 5/18 ship · 解决"6 个链接堆头上"混乱
 *
 * 设计:
 *   · 左: KEY 字标
 *   · 右: 3 主链接 (Home | 写决定 | Brain) + "更多 ▾" 折叠 5 次级
 *   · "更多" 展开: Pulse · 未交付的信 · 历史 · 设置 · 找回
 *
 * Props:
 *   · current: 当前页 id (高亮)
 *   · variant: 'authed' (默认 · 显示主链接) | 'public' (只显示 Home 链接)
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import KeyWordmark from './KeyWordmark';

type NavId = 'home' | 'decisions' | 'brain' | 'pulse' | 'unsent' | 'history' | 'settings' | 'recover' | 'your-pattern' | 'outcomes' | 'review' | 'letters' | null;

export default function KeyHeader({
  current,
  variant = 'authed',
}: {
  current?: NavId;
  variant?: 'authed' | 'public';
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [menuOpen]);

  const linkCls = (id: NavId) =>
    `text-[11px] font-sans uppercase tracking-[0.2em] transition-colors ${
      current === id
        ? 'text-seal-500'
        : 'text-ink-500 hover:text-seal-500'
    }`;

  return (
    <nav className="max-w-prose-xl mx-auto px-6 pt-10 pb-6 flex justify-between items-baseline">
      <Link href={variant === 'authed' ? '/home' : '/'} aria-label="KEY home" className="block">
        <KeyWordmark variant="nav" height={22} />
      </Link>

      <div className="flex gap-5 items-baseline">
        {variant === 'authed' ? (
          <>
            <Link href="/home" className={linkCls('home')}>Home</Link>
            <Link href="/decisions/new" className={linkCls('decisions')}>写决定</Link>
            <Link href="/brain" className={linkCls('brain')}>Brain</Link>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`${linkCls(null)} cursor-pointer`}
                aria-expanded={menuOpen}
              >
                更多 {menuOpen ? '▴' : '▾'}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-3 bg-paper border border-paper-300 shadow-md min-w-[140px] py-2 z-50">
                  <DropdownItem href="/pulse" current={current === 'pulse'}>今日一句</DropdownItem>
                  <DropdownItem href="/unsent" current={current === 'unsent'}>未交付的信</DropdownItem>
                  <DropdownItem href="/letters/new" current={current === 'letters'}>写给 KEY</DropdownItem>
                  <DropdownItem href="/history" current={current === 'history'}>历史决策</DropdownItem>
                  <DropdownItem href="/outcomes" current={current === 'outcomes'}>决策回访 (30/90/365)</DropdownItem>
                  <DropdownItem href="/review" current={current === 'review'}>Weekly</DropdownItem>
                  <DropdownItem href="/your-pattern" current={current === 'your-pattern'}>决策画像</DropdownItem>
                  <div className="my-1.5 border-t border-paper-200" />
                  <DropdownItem href="/settings" current={current === 'settings'}>设置</DropdownItem>
                  <DropdownItem href="/recover" current={current === 'recover'}>找回 / 恢复码</DropdownItem>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link href="/methodology" className={linkCls(null)}>方法论</Link>
            <Link href="/sample-brief" className={linkCls(null)}>样品</Link>
            <Link href="/invite" className={linkCls(null)}>激活</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function DropdownItem({
  href, current, children,
}: { href: string; current: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`block px-4 py-2 text-[12px] font-sans transition-colors ${
        current
          ? 'text-seal-500 bg-paper-50'
          : 'text-ink-700 hover:bg-paper-50 hover:text-seal-500'
      }`}
    >
      {children}
    </Link>
  );
}
