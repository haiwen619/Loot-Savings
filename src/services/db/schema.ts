export const DB_NAME = "loot_savings_db";
export const DB_VERSION = 1;

export const DB_SCHEMA_DDL = `
CREATE TABLE IF NOT EXISTS jars (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  target_amount REAL NOT NULL,
  current_amount REAL NOT NULL DEFAULT 0,
  currency TEXT DEFAULT '¥',
  deadline TEXT,
  theme_color TEXT NOT NULL DEFAULT 'emerald',
  emoji TEXT NOT NULL DEFAULT '🍯',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_jars_created ON jars(created_at);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  jar_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('deposit', 'withdraw')),
  amount REAL NOT NULL,
  note TEXT,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (jar_id) REFERENCES jars(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tx_jar_time ON transactions(jar_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;
