/**
 * /transparency page content · loader + types
 */

import path from 'path';
import fs from 'fs';

export interface TransparencyHero {
  eyebrow: string;
  title: string;
  body: string[];
}

export interface TransparencyIntroSection {
  numeral: string;
  title: string;
  englishTitle: string;
  intro: string[];
}

export interface TransparencyBodySection {
  numeral: string;
  title: string;
  englishTitle: string;
  body: string[];
}

export interface TransparencyStepsSection {
  numeral: string;
  title: string;
  englishTitle: string;
  body: string[];
  steps: string[];
}

/** 用户版透明度 · 6-8 条普通话保证 (放 hero 后, 技术附录前). */
export interface TransparencyUserFacingItem {
  title: string;      // 短标题, e.g. "AI 不能编你没说过的事"
  detail: string;     // 一句解释
}

export interface TransparencyUserFacing {
  eyebrow: string;    // "· 为什么你可以信任 KEY ·"
  title: string;      // "我们怎么防止 AI 出错."
  intro: string[];    // 1-2 段引言
  items: TransparencyUserFacingItem[]; // 6-8 条
  ctaLabel: string;   // "查看完整技术审计 →"
  ctaHref: string;    // "#technical-appendix"
}

export interface TransparencyContent {
  version: number;
  hero: TransparencyHero;
  userFacing: TransparencyUserFacing;
  sectionGrader: TransparencyIntroSection;
  sectionInspector: TransparencyIntroSection;
  sectionBrief: TransparencyIntroSection;
  sectionNotMeasured: TransparencyBodySection;
  sectionHowToQuestion: TransparencyStepsSection;
  sectionFailVisibly: TransparencyBodySection;
}

const DATA_PATH = path.join(process.cwd(), 'lib', 'content', 'data', 'transparency.json');
let _cached: TransparencyContent | null = null;

export function loadTransparencyContent(): TransparencyContent {
  if (_cached) return _cached;
  try {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) as TransparencyContent;
    _cached = data;
    return data;
  } catch (e) {
    throw new Error(`Failed to load transparency: ${(e as Error).message}`);
  }
}

export function writeTransparencyContent(content: TransparencyContent): void {
  validateTransparencyContent(content);
  fs.writeFileSync(DATA_PATH, JSON.stringify(content, null, 2) + '\n', 'utf8');
  _cached = null;
}

export function validateTransparencyContent(c: any): asserts c is TransparencyContent {
  if (!c?.hero?.title) throw new Error('hero.title missing');
  if (!Array.isArray(c.sectionHowToQuestion?.steps)) {
    throw new Error('sectionHowToQuestion.steps required');
  }
  if (!c.userFacing?.title) throw new Error('userFacing.title missing');
  if (!Array.isArray(c.userFacing?.items) || c.userFacing.items.length === 0) {
    throw new Error('userFacing.items must be non-empty array');
  }
  for (const [i, item] of c.userFacing.items.entries()) {
    if (!item.title || !item.detail) {
      throw new Error(`userFacing.items[${i}] missing title or detail`);
    }
  }
}
