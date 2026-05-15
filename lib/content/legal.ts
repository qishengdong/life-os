/**
 * /terms + /privacy · shared loader (both pages use same shape).
 */

import path from 'path';
import fs from 'fs';

export interface LegalContent {
  version: number;
  header: { eyebrow: string; title: string; subtitle: string };
  bodyHtml: string; // 大段 HTML, 用 prose class 渲染
  footer: string;
}

function makeLoader(filename: 'terms.json' | 'privacy.json') {
  const DATA_PATH = path.join(process.cwd(), 'lib', 'content', 'data', filename);
  let cached: LegalContent | null = null;
  return {
    load(): LegalContent {
      if (cached) return cached;
      try {
        const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) as LegalContent;
        cached = data;
        return data;
      } catch (e) {
        throw new Error(`Failed to load ${filename}: ${(e as Error).message}`);
      }
    },
    write(content: LegalContent): void {
      validateLegalContent(content);
      fs.writeFileSync(DATA_PATH, JSON.stringify(content, null, 2) + '\n', 'utf8');
      cached = null;
    },
  };
}

const terms = makeLoader('terms.json');
const privacy = makeLoader('privacy.json');

export const loadTermsContent = terms.load;
export const writeTermsContent = terms.write;
export const loadPrivacyContent = privacy.load;
export const writePrivacyContent = privacy.write;

export function validateLegalContent(c: any): asserts c is LegalContent {
  if (!c?.header?.title) throw new Error('header.title missing');
  if (typeof c.bodyHtml !== 'string') throw new Error('bodyHtml must be string');
  if (c.bodyHtml.length === 0) throw new Error('bodyHtml cannot be empty');
}
