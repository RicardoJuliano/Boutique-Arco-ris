const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database.db');
const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// Tabela de usuários
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    UNIQUE NOT NULL,
    password_hash TEXT    NOT NULL,
    is_admin      INTEGER DEFAULT 0,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Adicionar is_admin em bancos existentes sem a coluna
try {
  db.exec('ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0');
} catch (_) {}

// Tabela de produtos
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    price       REAL    NOT NULL,
    category    TEXT    NOT NULL,
    style       TEXT    NOT NULL,
    colors      TEXT    NOT NULL,
    occasions   TEXT    NOT NULL,
    sizes       TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    tag         TEXT,
    image_url   TEXT,
    stock       INTEGER DEFAULT 0,
    active      INTEGER DEFAULT 1,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Tabela de recomendações
db.exec(`
  CREATE TABLE IF NOT EXISTS recommendations (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    answers    TEXT    NOT NULL,
    result     TEXT    NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Seed do catálogo inicial se a tabela estiver vazia
const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (productCount.count === 0) {
  const CATALOG = require('../data/catalog');
  const insert = db.prepare(`
    INSERT INTO products (name, price, category, style, colors, occasions, sizes, description, tag, stock)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const p of CATALOG) {
    insert.run(
      p.name,
      p.price,
      p.category,
      JSON.stringify(p.style),
      JSON.stringify(p.colors),
      JSON.stringify(p.occasions),
      JSON.stringify(p.sizes),
      p.desc || '',
      p.tag || null,
      10
    );
  }
}

module.exports = db;
