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

export interface TransparencyContent {
  version: number;
  hero: TransparencyHero;
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
}
