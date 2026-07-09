-- ============================================================
-- Boutique Arco-Íris — Schema PostgreSQL (Supabase)
-- Execute este script no SQL Editor do seu projeto Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT    NOT NULL,
  email         TEXT    UNIQUE NOT NULL,
  cpf           TEXT    UNIQUE,
  password_hash TEXT    NOT NULL,
  is_admin      BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        TEXT             NOT NULL,
  price       DOUBLE PRECISION NOT NULL,
  category    TEXT             NOT NULL,
  style       TEXT             NOT NULL DEFAULT '[]',
  colors      TEXT             NOT NULL DEFAULT '[]',
  occasions   TEXT             NOT NULL DEFAULT '[]',
  sizes       TEXT             NOT NULL DEFAULT '[]',
  description TEXT             NOT NULL DEFAULT '',
  tag         TEXT,
  image_url   TEXT,
  barcode     TEXT,
  stock       INTEGER          DEFAULT 0,
  active      BOOLEAN          DEFAULT true,
  created_at  TIMESTAMPTZ      DEFAULT NOW(),
  updated_at  TIMESTAMPTZ      DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_images (
  id         SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT    NOT NULL,
  position   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS recommendations (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers    TEXT    NOT NULL,
  result     TEXT    NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status          TEXT             NOT NULL DEFAULT 'processing',
  total           DOUBLE PRECISION NOT NULL,
  shipping_fee    DOUBLE PRECISION NOT NULL DEFAULT 0,
  address         TEXT             NOT NULL,
  shipping_method TEXT             NOT NULL,
  payment_method  TEXT             NOT NULL,
  created_at      TIMESTAMPTZ      DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER          NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
  product_id INTEGER          NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  size       TEXT             NOT NULL,
  quantity   INTEGER          NOT NULL,
  unit_price DOUBLE PRECISION NOT NULL
);

-- Após criar as tabelas, cadastre-se normalmente no site e então
-- execute esta query para se tornar admin (substitua pelo seu e-mail):
-- UPDATE users SET is_admin = true WHERE email = 'seu@email.com';
