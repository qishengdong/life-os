/**
 * Sample-brief page content · loader + types
 */

import path from 'path';
import fs from 'fs';

export interface SampleBriefHeader {
  eyebrow: string;
  title: string;
  body: string[];
  lastParagraphItalic?: boolean;
}

export interface SampleBriefSelector {
  eyebrow: string;
}

export interface SampleBriefFooter {
  eyebrow: string;
  title: string; // 可含 \n 换行
  subtitle: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  smallText: string;
}

export interface SampleBriefContent {
  version: number;
  header: SampleBriefHeader;
  selector: SampleBriefSelector;
  footer: SampleBriefFooter;
  frameworkLabels: Record<string, string>;
}

const DATA_PATH = path.join(process.cwd(), 'lib', 'content', 'data', 'sample-brief.json');
let _cached: SampleBriefContent | null = null;

export function loadSampleBriefContent(): SampleBriefContent {
  if (_cached) return _cached;
  try {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) as SampleBriefContent;
    _cached = data;
    return data;
  } catch (e) {
    throw new Error(`Failed to load sample-brief content: ${(e as Error).message}`);
  }
}

export function writeSampleBriefContent(content: SampleBriefContent): void {
  validateSampleBriefContent(content);
  fs.writeFileSync(DATA_PATH, JSON.stringify(content, null, 2) + '\n', 'utf8');
  _cached = null;
}

export function validateSampleBriefContent(c: any): asserts c is SampleBriefContent {
  if (!c?.header?.title) throw new Error('header.title missing');
  if (!Array.isArray(c.header.body)) throw new Error('header.body must be array');
  if (!c.footer?.ctaPrimary?.href) throw new Error('footer.ctaPrimary.href missing');
}
