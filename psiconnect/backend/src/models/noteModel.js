// Model de anotações clínicas
// Funções de acesso ao banco para a tabela "appointment_notes"

const pool = require('../config/database');

// Busca todas as anotações de uma consulta específica
async function findByAppointment(appointmentId) {
  const resultado = await pool.query(
    'SELECT * FROM appointment_notes WHERE appointment_id = $1 ORDER BY created_at DESC',
    [appointmentId]
  );
  return resultado.rows;
}

// Busca o histórico completo de um paciente
// Junta as anotações com a data da consulta para mostrar em ordem cronológica
async function findByPatient(patientId, userId) {
  const resultado = await pool.query(
    `SELECT n.*, a.scheduled_at
     FROM appointment_notes n
     JOIN appointments a ON a.id = n.appointment_id
     WHERE a.patient_id = $1 AND a.user_id = $2
     ORDER BY a.scheduled_at DESC`,
    [patientId, userId]
  );
  return resultado.rows;
}

// Cria uma nova anotação em uma consulta
async function create(appointmentId, content) {
  const resultado = await pool.query(
    'INSERT INTO appointment_notes (appointment_id, content) VALUES ($1, $2) RETURNING *',
    [appointmentId, content]
  );
  return resultado.rows[0];
}

// Atualiza o texto de uma anotação
async function update(id, content) {
  const resultado = await pool.query(
    'UPDATE appointment_notes SET content = $1 WHERE id = $2 RETURNING *',
    [content, id]
  );
  return resultado.rows[0] || null;
}

// Apaga uma anotação
async function remove(id) {
  const resultado = await pool.query(
    'DELETE FROM appointment_notes WHERE id = $1 RETURNING id',
    [id]
  );
  return resultado.rows[0] || null;
}

module.exports = { findByAppointment, findByPatient, create, update, remove };
