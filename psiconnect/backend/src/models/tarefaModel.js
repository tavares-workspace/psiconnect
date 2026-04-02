// Model de tarefas automáticas do sistema
// Geradas automaticamente por eventos (consulta realizada, aguardando retorno)

const pool = require('../config/database');

async function findPendentes(userId) {
  const r = await pool.query(
    `SELECT t.*, p.name AS patient_name
     FROM tarefas t
     LEFT JOIN patients p ON p.id = t.patient_id
     WHERE t.user_id = $1 AND t.done = false
     ORDER BY t.created_at DESC`,
    [userId]
  );
  return r.rows;
}

// Verifica se já existe uma tarefa do mesmo tipo para o mesmo paciente (evita duplicatas)
async function existePendente(userId, patientId, tipo) {
  const r = await pool.query(
    'SELECT id FROM tarefas WHERE user_id=$1 AND patient_id=$2 AND tipo=$3 AND done=false',
    [userId, patientId, tipo]
  );
  return r.rows.length > 0;
}

async function create(userId, patientId, titulo, tipo) {
  const r = await pool.query(
    'INSERT INTO tarefas (user_id, patient_id, titulo, tipo) VALUES ($1,$2,$3,$4) RETURNING *',
    [userId, patientId, titulo, tipo]
  );
  return r.rows[0];
}

async function marcarFeita(id, userId) {
  const r = await pool.query(
    'UPDATE tarefas SET done=true WHERE id=$1 AND user_id=$2 RETURNING *',
    [id, userId]
  );
  return r.rows[0] || null;
}

async function remove(id, userId) {
  const r = await pool.query(
    'DELETE FROM tarefas WHERE id=$1 AND user_id=$2 RETURNING id',
    [id, userId]
  );
  return r.rows[0] || null;
}

module.exports = { findPendentes, existePendente, create, marcarFeita, remove };
