/**
 * repositories/recommendationRepository.js
 * Queries SQL para a tabela `recommendations`.
 * answers e result são armazenados como JSON serializado (TEXT) porque
 * SQLite não tem tipo JSON nativo — o service serializa antes de salvar
 * e desserializa ao ler.
 */

const db = require('../config/database');

// Salvar uma nova recomendação vinculada ao usuário autenticado
// answers e result devem ser passados já como strings JSON
exports.save = function save({ userId, answers, result }) {
  const stmt = db.prepare(
    'INSERT INTO recommendations (user_id, answers, result) VALUES (?, ?, ?)'
  );
  const res = stmt.run(userId, answers, result);
  return Number(res.lastInsertRowid);
};

// Buscar histórico de recomendações de um usuário, do mais recente ao mais antigo
// Desserializa os campos JSON antes de retornar para evitar que o controller
// precise conhecer detalhes de armazenamento
exports.findByUser = function findByUser(userId) {
  const rows = db
    .prepare(
      'SELECT id, answers, result, created_at FROM recommendations WHERE user_id = ? ORDER BY created_at DESC'
    )
    .all(userId);

  return rows.map((row) => ({
    id: row.id,
    answers: JSON.parse(row.answers),
    result: JSON.parse(row.result),
    created_at: row.created_at,
  }));
};
