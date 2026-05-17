/**
 * DB client · 统一 async API
 *
 * Prod (Vercel): libSQL (Turso) HTTP · 持久化
 * Local dev: better-sqlite3 sync · wrap 成 async (callers 一致)
 */
import { createClient as createTursoClient, type Client as TursoClient } from '@libsql/client';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export interface DbStatement {
  get(...args: any[]): Promise<any | undefined>;
  all(...args: any[]): Promise<any[]>;
  run(...args: any[]): Promise<{ changes: number; lastInsertRowid: number | bigint }>;
}

export interface DbClient {
  prepare(sql: string): DbStatement;
  exec(sql: string): Promise<void>;
  pragma(query: string): Promise<any[]>;
  transaction<T>(fn: (db: DbClient) => Promise<T>): Promise<T>;
}

/**
 * libSQL 默认把 INTEGER 列序列化成 BigInt (≥2^53). NextResponse.json 不支持 BigInt
 * (会扔 "Do not know how to serialize a BigInt"). 这里在 wrap 层统一转 number.
 *
 * 备选方案: createTursoClient({ intMode: 'number' }) — 但官方文档说大整数会丢精度.
 * 我们的 schema 里 INTEGER 全是 id / unix timestamp / count, 都不会超过 2^53,
 * 安全用 Number().
 */
function normalizeRow<T>(row: T): T {
  if (!row || typeof row !== 'object') return row;
  const out: any = {};
  for (const [k, v] of Object.entries(row as any)) {
    out[k] = typeof v === 'bigint' ? Number(v) : v;
  }
  return out;
}

function wrapTurso(client: TursoClient): DbClient {
  return {
    prepare(sql: string): DbStatement {
      return {
        async get(...args: any[]) {
          const r = await client.execute({ sql, args });
          return r.rows[0] ? normalizeRow(r.rows[0]) : undefined;
        },
        async all(...args: any[]) {
          const r = await client.execute({ sql, args });
          return r.rows.map(normalizeRow) as any[];
        },
        async run(...args: any[]) {
          const r = await client.execute({ sql, args });
          return {
            changes: Number(r.rowsAffected),
            lastInsertRowid: typeof r.lastInsertRowid === 'bigint'
              ? Number(r.lastInsertRowid)
              : (r.lastInsertRowid ?? 0),
          };
        },
      };
    },
    async exec(sql: string) {
      const stmts = sql.split(';').map((s) => s.trim()).filter((s) => s.length > 0);
      for (const s of stmts) await client.execute(s);
    },
    async pragma(query: string) {
      const r = await client.execute(`PRAGMA ${query}`);
      return r.rows as any[];
    },
    async transaction<T>(fn: (db: DbClient) => Promise<T>): Promise<T> {
      // 简化版 · Turso libSQL 的 transaction API · 这里直接用 self (顺序执行已经够).
      // 真严格 ACID 需要 client.transaction('write'), 但 V1 内测期足够.
      return fn(this);
    },
  };
}

function wrapBetterSqlite(db: Database.Database): DbClient {
  return {
    prepare(sql: string): DbStatement {
      const stmt = db.prepare(sql);
      return {
        async get(...args: any[]) {
          return stmt.get(...args);
        },
        async all(...args: any[]) {
          return stmt.all(...args);
        },
        async run(...args: any[]) {
          const r = stmt.run(...args);
          return { changes: r.changes, lastInsertRowid: r.lastInsertRowid };
        },
      };
    },
    async exec(sql: string) {
      db.exec(sql);
    },
    async pragma(query: string) {
      return db.pragma(query) as any[];
    },
    async transaction<T>(fn: (client: DbClient) => Promise<T>): Promise<T> {
      // better-sqlite3 sync transaction · wrap async fn (但内部还是 sync 写)
      return fn(this);
    },
  };
}

let _client: DbClient | null = null;

export function getClient(): DbClient {
  if (_client) return _client;
  const TURSO_URL = process.env.TURSO_DATABASE_URL;
  const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;
  if (TURSO_URL && TURSO_TOKEN) {
    const turso = createTursoClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
    _client = wrapTurso(turso);
    console.log('[db] Using Turso (libSQL)');
  } else {
    const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'life-os.db');
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(dbPath)) {
      const seedPath = path.join(process.cwd(), 'scripts', 'seed-data', 'life-os-seed.db');
      if (fs.existsSync(seedPath)) {
        try { fs.copyFileSync(seedPath, dbPath); } catch {}
      }
    }
    const sqlite = new Database(dbPath);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
    _client = wrapBetterSqlite(sqlite);
    console.log(`[db] Using better-sqlite3 · ${dbPath}`);
  }
  return _client;
}
