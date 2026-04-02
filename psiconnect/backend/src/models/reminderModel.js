// Model de lembretes
// Funções de acesso ao banco para a tabela "reminders"

const pool = require('../config/database');

// Lista todos os lembretes do usuário, ordenados pela data
async function findAll(userId) {
  const resultado = await pool.query(
    'SELECT * FROM reminders WHERE user_id = $1 ORDER BY remind_at ASC',
    [userId]
  );
  return resultado.rows;
}

// Busca os lembretes pendentes de hoje (para o dashboard)
async function findHoje(userId) {
  const resultado = await pool.query(
    `SELECT * FROM reminders
     WHERE user_id = $1
       AND done = false
       AND remind_at::date = CURRENT_DATE
     ORDER BY remind_at ASC`,
    [userId]
  );
  return resultado.rows;
}

// Busca um lembrete específico pelo ID
async function findById(id, userId) {
  const resultado = await pool.query(
    'SELECT * FROM reminders WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return resultado.rows[0] || null;
}

// Cria um novo lembrete
async function create(userId, title, description, remindAt) {
  const resultado = await pool.query(
    `INSERT INTO reminders (user_id, title, description, remind_at)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, title, description || null, remindAt]
  );
  return resultado.rows[0];
}

// Atualiza um lembrete (inclusive para marcar como feito)
async function update(id, userId, title, description, remindAt, done) {
  const resultado = await pool.query(
    `UPDATE reminders
     SET title = $1, description = $2, remind_at = $3, done = $4
     WHERE id = $5 AND user_id = $6
     RETURNING *`,
    [title, description || null, remindAt, done, id, userId]
  );
  return resultado.rows[0] || null;
}

// Apaga um lembrete
async function remove(id, userId) {
  const resultado = await pool.query(
    'DELETE FROM reminders WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  return resultado.rows[0] || null;
}

module.exports = { findAll, findHoje, findById, create, update, remove };
