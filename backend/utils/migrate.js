import Database from 'better-sqlite3';

export function getDb() {
  const url = process.env.DATABASE_URL || './backend/db/database.sqlite';
  const db = new Database(url);
  db.pragma('journal_mode = WAL');
  return db;
}

export function ensureDb() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_role_mappings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      discord_server_id TEXT NOT NULL,
      discord_role_id TEXT NOT NULL,
      UNIQUE(company_id, product_id, discord_server_id, discord_role_id)
    );
    CREATE TABLE IF NOT EXISTS user_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      whop_user_id TEXT NOT NULL UNIQUE,
      discord_user_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS role_events_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      whop_user_id TEXT,
      product_id TEXT,
      action TEXT CHECK(action IN ('grant','revoke')),
      processed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  db.close();
}
