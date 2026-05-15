import path from 'path';
import fs from 'fs';

export interface PricingHero {
  eyebrow: string;
  kicker: string;
  title: string; // 可含 \n
  body: string;
}

export interface PricingTier {
  name: string;
  price: string;
  pricePeriod: string;
  yearly: string;
  position: string;
  badge?: string;
  bullets: { feature: string; included: boolean; emphasis?: boolean }[];
  cta: string;
  ctaStyle: 'seal' | 'ghost';
  href: string;
}

export interface PricingWhyThisPrice {
  title: string;
  intro: string;
  comparisons: { name: string; price: string; note: string }[];
  summary: string;
  tagline: string;
}

export interface PricingFaq {
  title: string;
  items: { q: string; a: string }[];
}

export interface PricingFooter {
  smallText: string;
  italic: string;
}

export interface PricingContent {
  version: number;
  hero: PricingHero;
  tiers: PricingTier[];
  whyThisPrice: PricingWhyThisPrice;
  faq: PricingFaq;
  footer: PricingFooter;
}

const DATA_PATH = path.join(process.cwd(), 'lib', 'content', 'data', 'pricing.json');
let _cached: PricingContent | null = null;

export function loadPricingContent(): PricingContent {
  if (_cached) return _cached;
  try {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) as PricingContent;
    _cached = data;
    return data;
  } catch (e) {
    throw new Error(`Failed to load pricing: ${(e as Error).message}`);
  }
}

export function writePricingContent(content: PricingContent): void {
  validatePricingContent(content);
  fs.writeFileSync(DATA_PATH, JSON.stringify(content, null, 2) + '\n', 'utf8');
  _cached = null;
}

export function validatePricingContent(c: any): asserts c is PricingContent {
  if (!c?.hero?.title) throw new Error('hero.title missing');
  if (!Array.isArray(c.tiers) || c.tiers.length === 0) throw new Error('tiers required');
}
