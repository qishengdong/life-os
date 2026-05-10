/**
 * 4-File Persona System (Sivon Maya doctrine 移植)
 *
 * 核心: 把散落的人格 / 声音 / 专业判断凝练成 4 份 markdown, 每次 reply 重读.
 *
 * 拼装顺序: persona → voice → expert → brain
 *
 * 关键纪律:
 *   - 4 文件不替代 RMC / user_core_state (那些是数据层)
 *   - 4 文件负责: 最终表达 / 人格稳定 / 上下文一致
 *   - 任何 voice 改动必经回归测试
 *
 * Cache: 60s TTL, 改 .md 后最多 1 分钟生效
 *
 * 安全开关: ENV LIFEOS_USE_4FILE_PROMPT=true 启用,
 *   错误立刻 fallback 到老 anti-chicken-soup.ts 单文件路径
 */

import fs from 'fs';
import path from 'path';

const PERSONA_DIR = path.join(process.cwd(), 'lib', 'personas');
const CACHE_TTL_MS = 60 * 1000; // 60s

interface CacheEntry {
  content: string;
  loadedAt: number;
}

const cache: Record<string, CacheEntry> = {};

function readPersonaFile(filename: string): string {
  const now = Date.now();
  const cached = cache[filename];
  if (cached && now - cached.loadedAt < CACHE_TTL_MS) {
    return cached.content;
  }

  const fullPath = path.join(PERSONA_DIR, filename);
  const content = fs.readFileSync(fullPath, 'utf-8');
  cache[filename] = { content, loadedAt: now };
  return content;
}

export function loadPersona(): string {
  return readPersonaFile('life-os-persona.md');
}

export function loadVoice(): string {
  return readPersonaFile('life-os-voice.md');
}

export function loadExpert(): string {
  return readPersonaFile('life-os-expert.md');
}

/**
 * 拼装 4-file persona system prompt.
 *
 * @param userBrainContent — per-user brain.md 内容(如有). 来自 user_brain 表.
 * @param framework — 当前路由到的决策框架, 用于注入框架特定 addendum
 * @param addendum — 框架特化的额外契约 (如 PARENT_CARE_ADDENDUM)
 * @returns 完整 system prompt
 */
export function buildPersonaSystemPrompt(args: {
  userBrainContent?: string | null;
  framework?: string;
  addendum?: string;
}): string {
  const parts: string[] = [];

  parts.push('=' .repeat(60));
  parts.push('# Life OS — Persona');
  parts.push('=' .repeat(60));
  parts.push(loadPersona());

  parts.push('\n' + '=' .repeat(60));
  parts.push('# Life OS — Voice (反鸡汤宪法)');
  parts.push('=' .repeat(60));
  parts.push(loadVoice());

  parts.push('\n' + '=' .repeat(60));
  parts.push('# Life OS — Expert (决策科学认知)');
  parts.push('=' .repeat(60));
  parts.push(loadExpert());

  if (args.addendum) {
    parts.push('\n' + '=' .repeat(60));
    parts.push(`# Framework-Specific Addendum (${args.framework || 'general'})`);
    parts.push('=' .repeat(60));
    parts.push(args.addendum);
  }

  if (args.userBrainContent) {
    parts.push('\n' + '=' .repeat(60));
    parts.push('# User Brain (this specific user, soft memory)');
    parts.push('=' .repeat(60));
    parts.push(args.userBrainContent);
  }

  return parts.join('\n');
}

/**
 * Feature flag: 是否启用 4-file 系统
 *
 * V0 上线时默认 OFF, 验证稳定后切 ON.
 * 出问题立刻 ENV 改回 false, 1 分钟内生效 (cache TTL).
 */
export function shouldUse4FilePrompt(): boolean {
  return process.env.LIFEOS_USE_4FILE_PROMPT === 'true';
}

/**
 * 强制刷新 cache (用于 admin 或修改 .md 后立刻生效)
 */
export function invalidatePersonaCache(): void {
  for (const key in cache) {
    delete cache[key];
  }
}
