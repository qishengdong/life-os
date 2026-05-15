/**
 * Home page content · loader + types
 *
 * 数据源: lib/content/data/home.json
 *
 * 这个文件被 CMS (/admin/cms) **读写** + 被 app/page.tsx 渲染时读取.
 * CMS 改动 → commit 到 git → Vercel auto-deploy → 线上生效.
 *
 * 设计原则:
 *   - JSON 是单一真实源
 *   - 类型在 TS 里, 严格 typed
 *   - 加 validate() 防止 CMS 写坏结构
 */

import path from 'path';
import fs from 'fs';

// ============================================================================
// Types — exported for both page render + CMS editors
// ============================================================================

export interface HomeCTA {
  label: string;
  href: string;
}

export interface HomeLead {
  label: string;       // "自我" / "子女" / "父母" / "转身"
  setup: string[];     // 1-3 段文字 (setup)
  truth: string;       // —— 真相 (italic)
  href?: string;       // 可选: "读 →" 链接目标 (e.g. /sample-brief?id=15)
}

export interface HomeBetterCallKey {
  en1: string;
  en2: string;
  cnSubtitle: string;
}

export interface HomeHero {
  brandStatementEn: string;
  brandStatementCn: string;
  subTag: string;
  explainer: string[];                // 多段 markdown-ish (允许 <em> <i>)
  ctas: {
    primary: HomeCTA;
    secondary: HomeCTA;
    ghost: HomeCTA;
  };
  leadsIntro: string;
  leads: HomeLead[];
  betterCallKey: HomeBetterCallKey;
}

export interface HomeFiveDomain {
  ch: string;
  en: string;
  note: string;
}

export interface HomeFiveDomains {
  title: string;
  items: HomeFiveDomain[];
}

export interface HomeFooterNavLink {
  label: string;
  href: string;
  emphasis?: boolean;
}

export interface HomeFooter {
  tagline: string;
  subtagline: string;
  aigcDisclaimer: string;
  navLinks: HomeFooterNavLink[];
}

/** 服务总声明 (替代原硬编码"卷首语" · KEY 是什么的服务级表达). */
export interface HomeEditorial {
  eyebrow: string;            // "· 这就是 KEY ·"
  title: string;              // "重大决定，不是找答案，是看清代价。"
  paragraphs: string[];       // 服务承诺 (短句, 不哄不诊断)
  ctaLabel: string;           // "读完整方法论 →"
  ctaHref: string;            // "/methodology"
}

export interface HomeWhatYouGetItem {
  num: string;                // "I" / "II" 罗马 (跟方法论同款排版)
  title: string;              // "你表面在问什么"
}

/** "What You Get" · 用户提交后会拿到什么 (KEY Brief 9 件事). */
export interface HomeWhatYouGet {
  eyebrow: string;            // "· 一份 KEY Brief 长这样 ·"
  title: string;              // "把一个决定拆成九件事."
  items: HomeWhatYouGetItem[]; // 9 个 (跟 brief schema 对齐)
  afterNote: string;          // "+ 30 / 90 / 365 天后, 我们一起回来复盘."
  ctaLabel: string;           // "读完整样品简报 →"
  ctaHref: string;            // "/sample-brief"
}

export interface HomeContent {
  version: number;
  hero: HomeHero;
  editorial: HomeEditorial;
  whatYouGet: HomeWhatYouGet;
  fiveDomains: HomeFiveDomains;
  footer: HomeFooter;
}

// ============================================================================
// Loader · 读 home.json
// ============================================================================

const DATA_PATH = path.join(process.cwd(), 'lib', 'content', 'data', 'home.json');

let _cached: HomeContent | null = null;

/**
 * 服务端读 home content.
 * 缓存在内存里 (Next.js 每次 server-render 都重新 import 模块, 所以缓存仅 in-request).
 * CMS 写入后, 下一次 page render 自动看到新内容 (Vercel rebuild).
 */
export function loadHomeContent(): HomeContent {
  if (_cached) return _cached;

  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    const data = JSON.parse(raw) as HomeContent;
    _cached = data;
    return data;
  } catch (e) {
    throw new Error(`Failed to load home content from ${DATA_PATH}: ${(e as Error).message}`);
  }
}

/**
 * CMS 用 · 写入新内容
 * (本地写文件; CMS 发布按钮单独走 GitHub API)
 */
export function writeHomeContent(content: HomeContent): void {
  validateHomeContent(content);
  const formatted = JSON.stringify(content, null, 2);
  fs.writeFileSync(DATA_PATH, formatted + '\n', 'utf8');
  _cached = null; // 失效 cache
}

/**
 * 简单 validate · 防 CMS 写出结构破坏
 */
export function validateHomeContent(c: any): asserts c is HomeContent {
  if (!c || typeof c !== 'object') throw new Error('content must be object');
  if (typeof c.version !== 'number') throw new Error('missing version');
  if (!c.hero || typeof c.hero !== 'object') throw new Error('missing hero');
  if (!Array.isArray(c.hero.leads) || c.hero.leads.length === 0) {
    throw new Error('hero.leads must be non-empty array');
  }
  if (c.hero.leads.length > 8) {
    throw new Error('hero.leads must be ≤ 8');
  }
  for (const [i, lead] of c.hero.leads.entries()) {
    if (!lead.label || typeof lead.label !== 'string') throw new Error(`leads[${i}].label invalid`);
    if (!Array.isArray(lead.setup) || lead.setup.length === 0) {
      throw new Error(`leads[${i}].setup must be non-empty array`);
    }
    if (!lead.truth || typeof lead.truth !== 'string') throw new Error(`leads[${i}].truth invalid`);
  }
  // editorial · 服务总声明
  if (!c.editorial || typeof c.editorial !== 'object') throw new Error('missing editorial');
  if (!c.editorial.title) throw new Error('editorial.title required');
  if (!Array.isArray(c.editorial.paragraphs) || c.editorial.paragraphs.length === 0) {
    throw new Error('editorial.paragraphs must be non-empty array');
  }
  // whatYouGet · 9 件事
  if (!c.whatYouGet || typeof c.whatYouGet !== 'object') throw new Error('missing whatYouGet');
  if (!c.whatYouGet.title) throw new Error('whatYouGet.title required');
  if (!Array.isArray(c.whatYouGet.items) || c.whatYouGet.items.length === 0) {
    throw new Error('whatYouGet.items must be non-empty array');
  }
  for (const [i, item] of c.whatYouGet.items.entries()) {
    if (!item.num || typeof item.num !== 'string') throw new Error(`whatYouGet.items[${i}].num invalid`);
    if (!item.title || typeof item.title !== 'string') throw new Error(`whatYouGet.items[${i}].title invalid`);
  }
}

/**
 * 加载 raw JSON 字符串 (CMS edit form 用 — 让用户直接看 JSON)
 */
export function loadHomeContentRaw(): string {
  return fs.readFileSync(DATA_PATH, 'utf8');
}
