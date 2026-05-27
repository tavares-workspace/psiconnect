
const pool = require('../config/database');

async function findByUserId(userId) {
  const resultado = await pool.query(
    'SELECT * FROM google_calendar_tokens WHERE user_id = $1',
    [userId]
  );
  return resultado.rows[0] || null;
}

async function salvar(userId, accessToken, refreshToken, expiresAt) {
  const resultado = await pool.query(
    `INSERT INTO google_calendar_tokens (user_id, access_token, refresh_token, expires_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE
       SET access_token = $2, refresh_token = $3, expires_at = $4, updated_at = NOW()
     RETURNING *`,
    [userId, accessToken, refreshToken, expiresAt]
  );
  return resultado.rows[0];
}

async function remove(userId) {
  await pool.query('DELETE FROM google_calendar_tokens WHERE user_id = $1', [userId]);
}

module.exports = { findByUserId, salvar, remove };
