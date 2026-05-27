const db = require('../config/database');

exports.save = function save({ userId, answers, result }) {
  const stmt = db.prepare(
    'INSERT INTO recommendations (user_id, answers, result) VALUES (?, ?, ?)'
  );
  const res = stmt.run(userId, answers, result);
  return Number(res.lastInsertRowid);
};

exports.findByUser = function findByUser(userId) {
  const rows = db
    .prepare(
      'SELECT id, answers, result, created_at FROM recommendations WHERE user_id = ? ORDER BY created_at DESC'
    )
    .all(userId);

  return rows.map((row) => ({
    id:         row.id,
    answers:    JSON.parse(row.answers),
    result:     JSON.parse(row.result),
    created_at: row.created_at,
  }));
};
