// Model de consultas — duração fixa de 60 minutos
const pool = require('../config/database');

async function findAll(userId, dataInicio, dataFim, patientId) {
  let query = `
    SELECT a.*, p.name AS patient_name, p.phone AS patient_phone,
           p.email AS patient_email, p.funil_etapa
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    WHERE a.user_id = $1
  `;
  const params = [userId];

  if (dataInicio && dataFim) {
    params.push(dataInicio, dataFim);
    query += ` AND a.scheduled_at BETWEEN $${params.length-1} AND $${params.length}`;
  }
  if (patientId) {
    params.push(patientId);
    query += ` AND a.patient_id = $${params.length}`;
  }

  query += ' ORDER BY a.scheduled_at ASC';
  const r = await pool.query(query, params);
  return r.rows;
}

async function findById(id, userId) {
  const r = await pool.query(
    `SELECT a.*, p.name AS patient_name, p.funil_etapa
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     WHERE a.id=$1 AND a.user_id=$2`,
    [id, userId]
  );
  return r.rows[0] || null;
}

async function findProximas(userId, limite) {
  const r = await pool.query(
    `SELECT a.*, p.name AS patient_name, p.funil_etapa
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     WHERE a.user_id=$1 AND a.status='scheduled' AND a.scheduled_at >= NOW()
     ORDER BY a.scheduled_at ASC
     LIMIT $2`,
    [userId, limite || 5]
  );
  return r.rows;
}

async function findRecentes(userId, limite) {
  const r = await pool.query(
    `SELECT a.*, p.name AS patient_name
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     WHERE a.user_id=$1 AND a.status='completed'
     ORDER BY a.scheduled_at DESC
     LIMIT $2`,
    [userId, limite || 5]
  );
  return r.rows;
}

// Busca consultas realizadas há mais de 1 hora sem prontuário preenchido
async function findSemProntuarioApos1h(userId) {
  const r = await pool.query(
    `SELECT a.*, p.name AS patient_name, p.user_id
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     LEFT JOIN prontuarios pr ON pr.patient_id = a.patient_id
     WHERE a.user_id=$1
       AND a.status='completed'
       AND a.scheduled_at <= NOW() - INTERVAL '1 hour'
       AND (pr.id IS NULL OR pr.evolucao_encrypted IS NULL)`,
    [userId]
  );
  return r.rows;
}

// Dashboard: totais por status no mês atual
async function countsByStatus(userId) {
  const r = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE status='scheduled') AS agendadas,
       COUNT(*) FILTER (WHERE status='completed') AS realizadas,
       COUNT(*) FILTER (WHERE status='cancelled') AS canceladas,
       COUNT(*) FILTER (WHERE status='scheduled' AND scheduled_at::date = CURRENT_DATE) AS hoje,
       COUNT(*) FILTER (WHERE status='scheduled'
         AND scheduled_at >= date_trunc('week', NOW())
         AND scheduled_at <  date_trunc('week', NOW()) + INTERVAL '7 days') AS semana
     FROM appointments
     WHERE user_id=$1
       AND date_trunc('month', scheduled_at) = date_trunc('month', NOW())`,
    [userId]
  );
  return r.rows[0];
}

// Consultas por mês (últimos 6 meses) — para gráfico
async function countsPorMes(userId) {
  const r = await pool.query(
    `SELECT
       TO_CHAR(scheduled_at, 'MM/YYYY') AS mes,
       COUNT(*) FILTER (WHERE status='completed') AS realizadas,
       COUNT(*) FILTER (WHERE status='scheduled') AS agendadas,
       COUNT(*) FILTER (WHERE status='cancelled') AS canceladas
     FROM appointments
     WHERE user_id=$1
       AND scheduled_at >= NOW() - INTERVAL '6 months'
     GROUP BY mes, date_trunc('month', scheduled_at)
     ORDER BY date_trunc('month', scheduled_at)`,
    [userId]
  );
  return r.rows;
}

// Duração sempre 60 minutos
async function create(userId, patientId, scheduledAt, price) {
  const r = await pool.query(
    `INSERT INTO appointments (user_id, patient_id, scheduled_at, duration_minutes, price)
     VALUES ($1, $2, $3, 60, $4)
     RETURNING *`,
    [userId, patientId, scheduledAt, price || null]
  );
  return r.rows[0];
}

async function update(id, userId, patientId, scheduledAt, status, price) {
  const r = await pool.query(
    `UPDATE appointments
     SET patient_id=$1, scheduled_at=$2, duration_minutes=60, status=$3, price=$4
     WHERE id=$5 AND user_id=$6
     RETURNING *`,
    [patientId, scheduledAt, status, price||null, id, userId]
  );
  return r.rows[0] || null;
}

async function updateStatus(id, userId, status) {
  const r = await pool.query(
    'UPDATE appointments SET status=$1 WHERE id=$2 AND user_id=$3 RETURNING *',
    [status, id, userId]
  );
  return r.rows[0] || null;
}

async function saveGoogleEventId(id, googleEventId) {
  await pool.query(
    'UPDATE appointments SET google_event_id=$1 WHERE id=$2',
    [googleEventId, id]
  );
}

module.exports = {
  findAll, findById, findProximas, findRecentes,
  findSemProntuarioApos1h, countsByStatus, countsPorMes,
  create, update, updateStatus, saveGoogleEventId,
};
