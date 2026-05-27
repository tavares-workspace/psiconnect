const pool = require('../config/database');

async function findAll(userId, dataInicio, dataFim, patientId) {
  let query = `
    SELECT a.*, p.name AS patient_name, p.phone AS patient_phone,
           p.email AS patient_email, p.funil_etapa, p.birth_date
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
    `SELECT a.*, p.name AS patient_name, p.email AS patient_email, p.funil_etapa
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     WHERE a.id=$1 AND a.user_id=$2`,
    [id, userId]
  );
  return r.rows[0] || null;
}

async function findByRecorrencia(recorrenciaId, userId) {
  const r = await pool.query(
    `SELECT a.*, p.name AS patient_name FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     WHERE a.recorrencia_id=$1 AND a.user_id=$2
     ORDER BY a.scheduled_at ASC`,
    [recorrenciaId, userId]
  );
  return r.rows;
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

async function findSemProntuarioApos1h(userId) {
  const r = await pool.query(
    `SELECT a.*, p.name AS patient_name, p.user_id
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     LEFT JOIN prontuarios pr ON pr.patient_id = a.patient_id
     WHERE a.user_id=$1
       AND a.status='completed'
       AND a.scheduled_at <= NOW() - INTERVAL '1 hour'
       AND (pr.id IS NULL OR pr.evolucao_encrypted IS NULL OR pr.evolucao_encrypted = '')`,
    [userId]
  );
  return r.rows;
}

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

async function countsPorMes(userId) {
  const r = await pool.query(
    `SELECT
       TO_CHAR(scheduled_at, 'MM/YYYY') AS mes,
       date_trunc('month', scheduled_at) AS mes_ordem,
       COUNT(*) FILTER (WHERE status='completed') AS realizadas,
       COUNT(*) FILTER (WHERE status='scheduled') AS agendadas,
       COUNT(*) FILTER (WHERE status='cancelled') AS canceladas
     FROM appointments
     WHERE user_id=$1
       AND scheduled_at >= NOW() - INTERVAL '6 months'
     GROUP BY mes, mes_ordem
     ORDER BY mes_ordem`,
    [userId]
  );
  return r.rows;
}

async function create(userId, patientId, scheduledAt, recorrenciaId, recorrenciaTipo) {
  const r = await pool.query(
    `INSERT INTO appointments (user_id, patient_id, scheduled_at, duration_minutes, recorrencia_id, recorrencia_tipo)
     VALUES ($1, $2, $3, 60, $4, $5)
     RETURNING *`,
    [userId, patientId, scheduledAt, recorrenciaId || null, recorrenciaTipo || null]
  );
  return r.rows[0];
}

async function update(id, userId, patientId, scheduledAt, status) {
  const r = await pool.query(
    `UPDATE appointments
     SET patient_id=$1, scheduled_at=$2, duration_minutes=60, status=$3
     WHERE id=$4 AND user_id=$5
     RETURNING *`,
    [patientId, scheduledAt, status, id, userId]
  );
  return r.rows[0] || null;
}

async function updateAllRecorrencia(recorrenciaId, userId, patientId, novoHorario) {
  const base = new Date(novoHorario);
  const r = await pool.query(
    `UPDATE appointments
     SET patient_id=$1,
         scheduled_at = scheduled_at::date + $2::time
     WHERE recorrencia_id=$3 AND user_id=$4
       AND status='scheduled' AND scheduled_at >= NOW()
     RETURNING *`,
    [patientId, `${String(base.getHours()).padStart(2,'0')}:${String(base.getMinutes()).padStart(2,'0')}:00`, recorrenciaId, userId]
  );
  return r.rows;
}

async function updateStatus(id, userId, status) {
  const r = await pool.query(
    'UPDATE appointments SET status=$1 WHERE id=$2 AND user_id=$3 RETURNING *',
    [status, id, userId]
  );
  return r.rows[0] || null;
}

async function cancelOne(id, userId) {
  return await updateStatus(id, userId, 'cancelled');
}

async function cancelAllRecorrencia(recorrenciaId, userId) {
  const r = await pool.query(
    `UPDATE appointments SET status='cancelled'
     WHERE recorrencia_id=$1 AND user_id=$2
       AND status='scheduled' AND scheduled_at >= NOW()
     RETURNING id`,
    [recorrenciaId, userId]
  );
  return r.rows;
}

async function saveGoogleEventId(id, googleEventId) {
  await pool.query('UPDATE appointments SET google_event_id=$1 WHERE id=$2', [googleEventId, id]);
}

module.exports = {
  findAll, findById, findByRecorrencia, findProximas, findRecentes,
  findSemProntuarioApos1h, countsByStatus, countsPorMes,
  create, update, updateAllRecorrencia, updateStatus,
  cancelOne, cancelAllRecorrencia, saveGoogleEventId,
};
