const pool = require('../config/database');

exports.save = async function save({ userId, answers, result }) {
  const { rows } = await pool.query(
    'INSERT INTO recommendations (user_id, answers, result) VALUES ($1, $2, $3) RETURNING id',
    [userId, answers, result]
  );
  return rows[0].id;
};

exports.findByUser = async function findByUser(userId) {
  const { rows } = await pool.query(
    'SELECT id, answers, result, created_at FROM recommendations WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return rows.map((row) => ({
    id:         row.id,
    answers:    JSON.parse(row.answers),
    result:     JSON.parse(row.result),
    created_at: row.created_at,
  }));
};
