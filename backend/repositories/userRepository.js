const db = require('../config/database');

exports.findByEmail = function findByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) || null;
};

exports.findById = function findById(id) {
  return db.prepare('SELECT id, name, email, cpf, is_admin, created_at FROM users WHERE id = ?').get(id) || null;
};

exports.findByCPF = function findByCPF(cpf) {
  return db.prepare('SELECT id, name, email, cpf FROM users WHERE cpf = ?').get(cpf) || null;
};

exports.create = function create({ name, email, cpf, passwordHash, isAdmin = 0 }) {
  const stmt = db.prepare(
    'INSERT INTO users (name, email, cpf, password_hash, is_admin) VALUES (?, ?, ?, ?, ?)'
  );
  const result = stmt.run(name, email, cpf, passwordHash, isAdmin);
  return { id: Number(result.lastInsertRowid), name, email, cpf, isAdmin };
};
