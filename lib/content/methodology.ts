/**
 * Methodology page content · loader + types
 *
 * 数据源: lib/content/data/methodology.json
 * 渲染: app/methodology/page.tsx
 * 编辑: /admin/cms (方法论 tab)
 */

import path from 'path';
import fs from 'fs';

// ============================================================================
// Types
// ============================================================================

export interface MethodologyContract {
  numeral: string;
  title: string;
  englishTitle: string;
  hook: string;
  body: string[];
  contrast: {
    aiAssistedQuote: string;
    aiNativeQuote: string;
  };
  lineage: {
    authority: string;
    citation: string;
    insight: string;
  };
  sampleAnchor: 'parent-care' | 'marriage' | 'child-education';
}

export interface MethodologyOpening {
  eyebrow: string;
  title: string;
  body: string[];
}

export interface MethodologyClosing {
  body: string[];
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
}

export interface MethodologyContent {
  version: number;
  opening: MethodologyOpening;
  contracts: MethodologyContract[];
  closing: MethodologyClosing;
}

// ============================================================================
// Loader
// ============================================================================

const DATA_PATH = path.join(process.cwd(), 'lib', 'content', 'data', 'methodology.json');

let _cached: MethodologyContent | null = null;

export function loadMethodologyContent(): MethodologyContent {
  if (_cached) return _cached;
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    const data = JSON.parse(raw) as MethodologyContent;
    _cached = data;
    return data;
  } catch (e) {
    throw new Error(`Failed to load methodology content: ${(e as Error).message}`);
  }
}

export function writeMethodologyContent(content: MethodologyContent): void {
  validateMethodologyContent(content);
  fs.writeFileSync(DATA_PATH, JSON.stringify(content, null, 2) + '\n', 'utf8');
  _cached = null;
}

export function validateMethodologyContent(c: any): asserts c is MethodologyContent {
  if (!c || typeof c !== 'object') throw new Error('content must be object');
  if (typeof c.version !== 'number') throw new Error('missing version');
  if (!c.opening?.title) throw new Error('opening.title missing');
  if (!Array.isArray(c.contracts) || c.contracts.length === 0) {
    throw new Error('contracts must be non-empty array');
  }
  for (const [i, contract] of c.contracts.entries()) {
    if (!contract.numeral || !contract.title) {
      throw new Error(`contracts[${i}] missing numeral or title`);
    }
    if (!Array.isArray(contract.body)) {
      throw new Error(`contracts[${i}].body must be array`);
    }
  }
  if (!c.closing?.ctaPrimary?.href) throw new Error('closing.ctaPrimary missing');
}
