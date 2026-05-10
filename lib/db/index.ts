import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dataDir, 'life-os.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  _db = new Database(dbPath);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  // Initialize schema (idempotent)
  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      birth_date TEXT NOT NULL,
      gender TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()),
      UNIQUE(birth_date, gender)
    );

    CREATE TABLE IF NOT EXISTS decisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      ai_response TEXT,
      model_used TEXT,
      tokens_input INTEGER,
      tokens_output INTEGER,
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_decisions_user_id ON decisions(user_id);
    CREATE INDEX IF NOT EXISTS idx_decisions_created_at ON decisions(created_at);

    CREATE TABLE IF NOT EXISTS facts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      fact TEXT NOT NULL,
      category TEXT,
      confidence REAL DEFAULT 1.0,
      source TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      last_seen_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_facts_user_id ON facts(user_id);
    CREATE INDEX IF NOT EXISTS idx_facts_category ON facts(category);
  `);

  return _db;
}

export function findOrCreateUser(birthDate: string, gender: string): number {
  const db = getDb();
  const existing = db
    .prepare('SELECT id FROM users WHERE birth_date = ? AND gender = ?')
    .get(birthDate, gender) as { id: number } | undefined;
  if (existing) return existing.id;

  const result = db
    .prepare('INSERT INTO users (birth_date, gender) VALUES (?, ?)')
    .run(birthDate, gender);
  return result.lastInsertRowid as number;
}

export function saveDecision(args: {
  userId: number;
  question: string;
  aiResponse: string;
  modelUsed: string;
  tokensInput?: number;
  tokensOutput?: number;
}): number {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO decisions (user_id, question, ai_response, model_used, tokens_input, tokens_output)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      args.userId,
      args.question,
      args.aiResponse,
      args.modelUsed,
      args.tokensInput ?? null,
      args.tokensOutput ?? null
    );
  return result.lastInsertRowid as number;
}
