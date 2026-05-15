/**
 * Membership page content · loader + types
 */

import path from 'path';
import fs from 'fs';

export interface MembershipHero {
  eyebrow: string;
  title: string;
  subtitle: string[];
}

export interface MembershipSection {
  numeral: string;
  title: string;
  englishTitle: string;
  body: string[];
}

export interface MembershipTier {
  numeral: string;
  name: string;
  englishName: string;
  price: string;
  priceNote: string;
  who: string;
  includes: string[];
  notes: string;
}

export interface MembershipRefund {
  numeral: string;
  title: string;
  englishTitle: string;
  body: string[];
  process: string[];
}

export interface MembershipWeDoNotItem {
  title: string;
  body: string;
}

export interface MembershipWeDoNot {
  numeral: string;
  title: string;
  englishTitle: string;
  intro: string;
  items: MembershipWeDoNotItem[];
}

export interface MembershipJoin {
  numeral: string;
  title: string;
  englishTitle: string;
  body: string[];
  steps: string[];
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  ctaTertiary: { label: string; href: string };
}

export interface MembershipContent {
  version: number;
  hero: MembershipHero;
  whyYear: MembershipSection;
  anchor: MembershipSection;
  tiers: MembershipTier[];
  refund: MembershipRefund;
  weDoNot: MembershipWeDoNot;
  join: MembershipJoin;
}

const DATA_PATH = path.join(process.cwd(), 'lib', 'content', 'data', 'membership.json');
let _cached: MembershipContent | null = null;

export function loadMembershipContent(): MembershipContent {
  if (_cached) return _cached;
  try {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) as MembershipContent;
    _cached = data;
    return data;
  } catch (e) {
    throw new Error(`Failed to load membership: ${(e as Error).message}`);
  }
}

export function writeMembershipContent(content: MembershipContent): void {
  validateMembershipContent(content);
  fs.writeFileSync(DATA_PATH, JSON.stringify(content, null, 2) + '\n', 'utf8');
  _cached = null;
}

export function validateMembershipContent(c: any): asserts c is MembershipContent {
  if (!c?.hero?.title) throw new Error('hero.title missing');
  if (!Array.isArray(c.tiers) || c.tiers.length === 0) throw new Error('tiers required');
  if (!c.join?.ctaPrimary?.href) throw new Error('join.ctaPrimary missing');
}
