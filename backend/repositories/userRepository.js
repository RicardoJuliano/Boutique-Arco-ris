const pool = require('../config/database');

exports.findByEmail = async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
};

exports.findById = async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, name, email, cpf, is_admin, created_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

exports.findByCPF = async function findByCPF(cpf) {
  const { rows } = await pool.query('SELECT id, name, email, cpf FROM users WHERE cpf = $1', [cpf]);
  return rows[0] || null;
};

exports.create = async function create({ name, email, cpf, passwordHash, isAdmin = false }) {
  const { rows } = await pool.query(
    'INSERT INTO users (name, email, cpf, password_hash, is_admin) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [name, email, cpf, passwordHash, isAdmin]
  );
  return { id: rows[0].id, name, email, cpf, isAdmin };
};
