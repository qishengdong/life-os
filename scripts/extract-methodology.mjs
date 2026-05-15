#!/usr/bin/env node
/**
 * Extract methodology content from contracts.ts → methodology.json
 */
import { writeFileSync, mkdirSync } from 'fs';
import { CONTRACTS, METHODOLOGY_OPENING, METHODOLOGY_CLOSING } from '../lib/content/methodology/contracts.ts';

const json = {
  version: 1,
  opening: METHODOLOGY_OPENING,
  contracts: CONTRACTS,
  closing: METHODOLOGY_CLOSING,
};

const path = './lib/content/data/methodology.json';
writeFileSync(path, JSON.stringify(json, null, 2) + '\n', 'utf8');
console.log('wrote', path);
