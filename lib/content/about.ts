import path from 'path';
import fs from 'fs';

export interface AboutContent {
  version: number;
  hero: { eyebrow: string; title: string; subtitle: string };
  intro: { kicker: string; title: string; body: string[]; tagline: string };
  notWhat: { title: string; items: string[] };
  privacy: { title: string; items: string[] };
  emergency: {
    title: string;
    intro: string;
    contacts: { label: string; phone: string }[];
  };
  links: { label: string; desc: string; href: string }[];
  footer: { smallText: string; italic: string };
}

const DATA_PATH = path.join(process.cwd(), 'lib', 'content', 'data', 'about.json');
let _cached: AboutContent | null = null;

export function loadAboutContent(): AboutContent {
  if (_cached) return _cached;
  try {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) as AboutContent;
    _cached = data;
    return data;
  } catch (e) {
    throw new Error(`Failed to load about: ${(e as Error).message}`);
  }
}

export function writeAboutContent(content: AboutContent): void {
  validateAboutContent(content);
  fs.writeFileSync(DATA_PATH, JSON.stringify(content, null, 2) + '\n', 'utf8');
  _cached = null;
}

export function validateAboutContent(c: any): asserts c is AboutContent {
  if (!c?.hero?.title) throw new Error('hero.title missing');
}
