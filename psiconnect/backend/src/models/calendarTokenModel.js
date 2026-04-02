// Model dos tokens do Google Calendar
// Salva e recupera os tokens OAuth do Google para cada usuário

const pool = require('../config/database');

// Busca o token do Google de um usuário
async function findByUserId(userId) {
  const resultado = await pool.query(
    'SELECT * FROM google_calendar_tokens WHERE user_id = $1',
    [userId]
  );
  return resultado.rows[0] || null;
}

// Salva ou atualiza o token do Google
// Se já existir um token para o usuário, atualiza. Se não, cria.
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

// Remove o token (desconectar o Google Calendar)
async function remove(userId) {
  await pool.query('DELETE FROM google_calendar_tokens WHERE user_id = $1', [userId]);
}

module.exports = { findByUserId, salvar, remove };
