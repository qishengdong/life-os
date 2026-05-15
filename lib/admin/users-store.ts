/**
 * Admin users store · 读写 admin-config.json
 *
 * 持久化策略:
 *   - 本地 dev: 读写 lib/content/data/admin-config.json (filesystem)
 *   - Vercel prod: 读 bundled file (cold start 从 git 装载) + 写经 GitHub Contents API
 *   - 改动 → GitHub commit → Vercel auto-deploy → 新版本数据
 *
 * 数据 schema (admin-config.json):
 *   {
 *     "version": 1,
 *     "_meta": {
 *       "sessionSecret": "<random hex 64 chars>",
 *       "setupCompleted": true,
 *       "setupAt": <unix sec>
 *     },
 *     "users": [...],
 *     "invites": [...]
 *   }
 *
 * 第一次 setup 时, _meta.sessionSecret 自动生成. 之后保持不变.
 */

import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { commitFileToGitHub } from './github';

// ============================================================================
// Types
// ============================================================================

export type AdminRole = 'owner' | 'editor';

export interface AdminUser {
  id: string;              // "user_" + 12-char hex
  username: string;        // unique, lowercase ASCII
  displayName: string;     // 中文 OK, 用在 UI + commit committer name
  passwordHash: string;
  role: AdminRole;
  email: string;           // committer email, format: <username>@cms.keypoint.life
  createdAt: number;       // unix sec
  lastLoginAt: number | null;
  active: boolean;
}

export interface AdminInvite {
  token: string;           // "inv_" + 24 char hex (URL-safe enough)
  username: string;        // proposed username (owner pre-picks)
  displayName: string;     // 中文 OK
  role: AdminRole;
  note: string;            // free-form: 这个人是谁, 为啥邀
  createdBy: string;       // admin id of inviter
  createdAt: number;
  expiresAt: number;       // unix sec, 7 days
  usedAt: number | null;
  usedByAdminId: string | null;
}

export interface AdminConfig {
  version: number;
  _meta: {
    sessionSecret: string;
    setupCompleted: boolean;
    setupAt: number | null;
  };
  users: AdminUser[];
  invites: AdminInvite[];
}

// ============================================================================
// Paths & defaults
// ============================================================================

const DATA_DIR = path.join(process.cwd(), 'lib', 'content', 'data');
const DATA_FILE = 'admin-config.json';
const DATA_PATH = path.join(DATA_DIR, DATA_FILE);
const GIT_PATH = `lib/content/data/${DATA_FILE}`;

function defaultConfig(): AdminConfig {
  return {
    version: 1,
    _meta: {
      sessionSecret: crypto.randomBytes(32).toString('hex'),
      setupCompleted: false,
      setupAt: null,
    },
    users: [],
    invites: [],
  };
}

// ============================================================================
// Cache
// ============================================================================

// In-memory cache (Vercel function instance lifecycle).
// Invalidated when we write.
let _cache: AdminConfig | null = null;
let _cacheLoadedAt = 0;
const CACHE_TTL_MS = 60_000; // re-read file every 60s in case redeploy bundled new version

// ============================================================================
// Load (filesystem)
// ============================================================================

export function loadAdminConfig(): AdminConfig {
  if (_cache && Date.now() - _cacheLoadedAt < CACHE_TTL_MS) {
    return _cache;
  }

  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    const data = JSON.parse(raw) as AdminConfig;
    _cache = data;
    _cacheLoadedAt = Date.now();
    return data;
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      // file missing — bootstrap with empty defaults
      const empty = defaultConfig();
      _cache = empty;
      _cacheLoadedAt = Date.now();
      return empty;
    }
    throw new Error(`Failed to load admin config: ${e.message}`);
  }
}

/**
 * 是否 setup 完成 (有 owner 用户).
 * 用于 /admin/setup gate.
 */
export function isSetupCompleted(): boolean {
  const cfg = loadAdminConfig();
  return cfg._meta.setupCompleted && cfg.users.some((u) => u.role === 'owner' && u.active);
}

// ============================================================================
// Save (local + optional GitHub)
// ============================================================================

export interface SaveOptions {
  /** Commit to GitHub (require GITHUB_TOKEN). Default: try, but ok if fails on local dev. */
  commitToGitHub?: boolean;
  /** Commit message (only used if commitToGitHub=true) */
  commitMessage?: string;
  /** Author user (for committer email/name). If absent uses generic. */
  author?: { username: string; displayName: string; email: string };
}

export async function saveAdminConfig(
  cfg: AdminConfig,
  opts: SaveOptions = {},
): Promise<{ localSaved: boolean; githubCommit?: { sha: string; url: string } }> {
  const formatted = JSON.stringify(cfg, null, 2) + '\n';

  let localSaved = false;
  // Try local filesystem write (works in dev, fails on Vercel read-only fs)
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_PATH, formatted, 'utf8');
    localSaved = true;
    _cache = cfg;
    _cacheLoadedAt = Date.now();
  } catch (e) {
    // expected on Vercel /var/task/lib (read-only) — fall through to GitHub
    console.warn('[admin-users-store] local write skipped:', (e as Error).message);
  }

  // Commit to GitHub (default true unless explicitly false)
  let githubCommit: { sha: string; url: string } | undefined;
  const shouldCommit = opts.commitToGitHub !== false;
  if (shouldCommit && process.env.GITHUB_TOKEN) {
    try {
      const result = await commitFileToGitHub({
        path: GIT_PATH,
        content: formatted,
        message: opts.commitMessage || 'admin: update admin-config',
        committer: opts.author
          ? { name: opts.author.displayName || opts.author.username, email: opts.author.email }
          : undefined,
      });
      githubCommit = { sha: result.commitSha, url: result.commitUrl };
      // refresh cache so subsequent reads see new data immediately
      _cache = cfg;
      _cacheLoadedAt = Date.now();
    } catch (e: any) {
      console.error('[admin-users-store] GitHub commit failed:', e.message);
      throw e;
    }
  }

  return { localSaved, githubCommit };
}

// ============================================================================
// User CRUD helpers
// ============================================================================

export function findUserByUsername(username: string): AdminUser | null {
  const cfg = loadAdminConfig();
  return cfg.users.find((u) => u.username === username.toLowerCase() && u.active) || null;
}

export function findUserById(id: string): AdminUser | null {
  const cfg = loadAdminConfig();
  return cfg.users.find((u) => u.id === id) || null;
}

export function listActiveUsers(): AdminUser[] {
  const cfg = loadAdminConfig();
  return cfg.users.filter((u) => u.active);
}

export function generateUserId(): string {
  return 'user_' + crypto.randomBytes(6).toString('hex');
}

export function generateInviteToken(): string {
  return 'inv_' + crypto.randomBytes(12).toString('hex');
}

export function makeCommitterEmail(username: string): string {
  return `${username}@cms.keypoint.life`;
}

// ============================================================================
// Invite CRUD
// ============================================================================

export function findInviteByToken(token: string): AdminInvite | null {
  const cfg = loadAdminConfig();
  return cfg.invites.find((i) => i.token === token) || null;
}

export function isInviteValid(invite: AdminInvite): boolean {
  if (invite.usedAt) return false;
  const now = Math.floor(Date.now() / 1000);
  if (invite.expiresAt < now) return false;
  return true;
}

// ============================================================================
// Update last login (NOT committed — only in-memory + best-effort local)
// ============================================================================

/**
 * 更新用户的 lastLoginAt. **不**触发 GitHub commit
 * (太频繁会污染 git history; lastLogin 是临时信息).
 * 仅 in-memory + 本地 (dev 时), prod 上 cold start 后会重置.
 */
export function updateLastLogin(adminId: string): void {
  const cfg = loadAdminConfig();
  const user = cfg.users.find((u) => u.id === adminId);
  if (!user) return;
  user.lastLoginAt = Math.floor(Date.now() / 1000);
  // best-effort local write only
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
    _cache = cfg;
  } catch {
    // ignore on Vercel
  }
}

// ============================================================================
// Force reload (for invalidating cache after external changes)
// ============================================================================

export function invalidateCache(): void {
  _cache = null;
  _cacheLoadedAt = 0;
}
