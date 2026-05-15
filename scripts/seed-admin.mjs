#!/usr/bin/env node
/**
 * One-off: seed admin-config.json with a first owner account.
 * Run: node scripts/seed-admin.mjs
 *
 * Used to bootstrap admin login when GITHUB_TOKEN isn't yet configured on Vercel
 * (which means /api/admin/setup would create the user but fail to persist it).
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const USERNAME = 'xiao';
const DISPLAY_NAME = '小石';
const PASSWORD = 'key-2026-life';
const ROLE = 'owner';

const N = 16384, R = 8, P = 1, KEYLEN = 32, SALTLEN = 16;
const MAX_MEM = 64 * 1024 * 1024;

function scryptAsync(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEYLEN, { N, r: R, p: P, maxmem: MAX_MEM }, (err, derivedKey) => {
      if (err) reject(err); else resolve(derivedKey);
    });
  });
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(SALTLEN);
  const hash = await scryptAsync(password, salt);
  return `scrypt$N=${N},r=${R},p=${P}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

const now = Math.floor(Date.now() / 1000);
const userId = 'user_' + crypto.randomBytes(6).toString('hex');
const passwordHash = await hashPassword(PASSWORD);
const sessionSecret = crypto.randomBytes(32).toString('hex');

const config = {
  version: 1,
  _meta: {
    sessionSecret,
    setupCompleted: true,
    setupAt: now,
  },
  users: [
    {
      id: userId,
      username: USERNAME,
      displayName: DISPLAY_NAME,
      passwordHash,
      role: ROLE,
      email: `${USERNAME}@cms.keypoint.life`,
      createdAt: now,
      lastLoginAt: null,
      active: true,
    },
  ],
  invites: [],
};

const outDir = path.join(process.cwd(), 'lib', 'content', 'data');
const outPath = path.join(outDir, 'admin-config.json');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(config, null, 2) + '\n', 'utf8');

console.log('seeded admin-config.json');
console.log('  username:', USERNAME);
console.log('  password:', PASSWORD);
console.log('  userId:  ', userId);
console.log('  path:    ', outPath);
