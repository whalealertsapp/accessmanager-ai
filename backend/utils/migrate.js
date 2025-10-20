import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const dbPath = path.resolve("backend/db/database.sqlite");
const dbDir = path.dirname(dbPath);

// ✅ Create the db folder automatically if it doesn’t exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export function getDb() {
  return new Database(dbPath);
}

export function ensureDb() {
  const db = getDb();
  db.prepare(`
    CREATE TABLE IF NOT EXISTS user_access (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT UNIQUE,
      whop_id TEXT,
      plan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
  db.close();
}
