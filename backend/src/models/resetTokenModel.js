const pool   = require('../config/database');
const crypto = require('crypto');

async function criar(userId) {
  // Invalida tokens anteriores do mesmo usuário
  await pool.query(
    'UPDATE password_reset_tokens SET used=true WHERE user_id=$1 AND used=false',
    [userId]
  );

  const token     = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );

  return token;
}

async function buscar(token) {
  const r = await pool.query(
    `SELECT * FROM password_reset_tokens
     WHERE token=$1 AND used=false AND expires_at > NOW()`,
    [token]
  );
  return r.rows[0] || null;
}

async function marcarUsado(token) {
  await pool.query(
    'UPDATE password_reset_tokens SET used=true WHERE token=$1',
    [token]
  );
}

module.exports = { criar, buscar, marcarUsado };
