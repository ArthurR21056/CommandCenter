const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'commandcenter.db');
const db = new Database(dbPath);

// Enforce foreign keys and WAL mode for performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ──────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    client_key TEXT    NOT NULL UNIQUE,
    name       TEXT    NOT NULL DEFAULT 'User',
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS skills (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    name        TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    method      TEXT    NOT NULL DEFAULT 'GET',
    url         TEXT    NOT NULL,
    headers     TEXT    NOT NULL DEFAULT '{}',
    body        TEXT    NOT NULL DEFAULT '',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS todos (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    name        TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    status      TEXT    NOT NULL DEFAULT 'todo',
    last_used   TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS skill_runs (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_id         INTEGER NOT NULL REFERENCES skills(id),
    user_id          INTEGER NOT NULL REFERENCES users(id),
    ran_at           TEXT    NOT NULL DEFAULT (datetime('now')),
    http_status      INTEGER,
    response_preview TEXT,
    error_message    TEXT
  );
`);

// ── Migrations ───────────────────────────────────────────────────────────────

const todoCols = db.pragma('table_info(todos)').map((c) => c.name);
if (!todoCols.includes('assignee_id')) {
  db.exec('ALTER TABLE todos ADD COLUMN assignee_id INTEGER REFERENCES users(id)');
}

module.exports = db;
