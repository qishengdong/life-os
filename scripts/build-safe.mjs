#!/usr/bin/env node
/**
 * build:safe — 安全跑 next build
 *
 * 问题: `next build` 会洗掉 .next/, 如果 dev server 正在运行,
 *      它持有的 webpack chunks 全部失效, 浏览器立刻 "Cannot find module './XXXX.js'".
 *
 * 这个脚本做三件事:
 *   1. 检测是否有 next dev 在跑
 *   2. 如果有, kill 它, 然后等 1 秒
 *   3. 跑 next build
 *   4. 提示用户用 dev:fresh 重启 dev
 */

import { execSync, spawnSync } from 'node:child_process';

function findNextDevPids() {
  try {
    const out = execSync('ps -A -o pid,command', { encoding: 'utf8' });
    return out
      .split('\n')
      .filter((line) => line.includes('next dev') && !line.includes('build-safe'))
      .map((line) => line.trim().split(/\s+/)[0])
      .filter(Boolean);
  } catch {
    return [];
  }
}

const pids = findNextDevPids();
if (pids.length > 0) {
  console.log(`⚠  检测到 next dev 在跑 (pid: ${pids.join(', ')}), 先 kill 再 build...`);
  for (const pid of pids) {
    try {
      process.kill(parseInt(pid, 10));
    } catch (e) {
      // ignore
    }
  }
  // 等 dev server 完全释放
  await new Promise((r) => setTimeout(r, 1500));
}

console.log('▶  next build...');
const r = spawnSync('npx', ['next', 'build'], { stdio: 'inherit' });

if (r.status === 0) {
  if (pids.length > 0) {
    console.log('');
    console.log('✓  build 完成. dev server 已被 kill — 用 `npm run dev:fresh` 重启.');
  } else {
    console.log('');
    console.log('✓  build 完成.');
  }
}

process.exit(r.status ?? 0);
