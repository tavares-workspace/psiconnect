const pool = require('../config/database');

const ETAPAS_FUNIL = [
  'Interessado', 'Triagem', 'Agendamento', 'Primeira Sessão',
  'Paciente Ativo', 'Aguardando Retorno', 'Alta/Encerrado', 'Abandono',
];

async function findAll(userId, busca) {
  let query = `
    SELECT * FROM patients
    WHERE user_id=$1 AND active=true
  `;
  const params = [userId];
  if (busca) {
    params.push(`%${busca}%`);
    query += ` AND (name ILIKE $2 OR email ILIKE $2 OR phone ILIKE $2)`;
  }
  query += ' ORDER BY name ASC';
  const r = await pool.query(query, params);
  return r.rows;
}

async function findById(id, userId) {
  const r = await pool.query(
    'SELECT * FROM patients WHERE id=$1 AND user_id=$2',
    [id, userId]
  );
  return r.rows[0] || null;
}

async function create(userId, name, email, phone, birthDate, cpf, address, notes) {
  const r = await pool.query(
    `INSERT INTO patients (user_id, name, email, phone, birth_date, cpf, address, notes, funil_etapa)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Interessado') RETURNING *`,
    [userId, name, email||null, phone||null, birthDate||null, cpf||null, address||null, notes||null]
  );
  return r.rows[0];
}

async function update(id, userId, name, email, phone, birthDate, cpf, address, notes) {
  const r = await pool.query(
    `UPDATE patients
     SET name=$1, email=$2, phone=$3, birth_date=$4, cpf=$5, address=$6, notes=$7
     WHERE id=$8 AND user_id=$9 RETURNING *`,
    [name, email||null, phone||null, birthDate||null, cpf||null, address||null, notes||null, id, userId]
  );
  return r.rows[0] || null;
}

// Exclusão permanente conforme LGPD:
// - Remove dados pessoais e clínicos do paciente
// - Anonimiza o registro para preservar métricas de agendamentos no dashboard
async function remove(id, userId) {
  // Remove prontuário
  await pool.query(
    'DELETE FROM prontuarios WHERE patient_id=$1', [id]
  );
  // Remove anotações clínicas
  await pool.query(
    `DELETE FROM appointment_notes WHERE appointment_id IN
     (SELECT id FROM appointments WHERE patient_id=$1)`, [id]
  );
  // Remove tarefas vinculadas
  await pool.query('DELETE FROM tarefas WHERE patient_id=$1', [id]);

  // Anonimiza o paciente — mantém o registro para não quebrar FK de appointments
  const r = await pool.query(
    `UPDATE patients
     SET name       = 'Paciente removido',
         email      = null,
         phone      = null,
         cpf        = null,
         address    = null,
         notes      = null,
         birth_date = null,
         active     = false
     WHERE id=$1 AND user_id=$2 RETURNING id`,
    [id, userId]
  );
  return r.rows[0] || null;
}

async function updateFunilEtapa(id, userId, etapa) {
  const r = await pool.query(
    'UPDATE patients SET funil_etapa=$1 WHERE id=$2 AND user_id=$3 RETURNING *',
    [etapa, id, userId]
  );
  return r.rows[0] || null;
}

async function avancarParaAgendamento(id, userId) {
  const paciente = await findById(id, userId);
  if (!paciente) return null;
  const indexAtual = ETAPAS_FUNIL.indexOf(paciente.funil_etapa);
  const indexAlvo  = ETAPAS_FUNIL.indexOf('Agendamento');
  if (indexAtual < indexAlvo) {
    return await updateFunilEtapa(id, userId, 'Agendamento');
  }
  return paciente;
}

async function countActive(userId) {
  const r = await pool.query(
    'SELECT COUNT(*) FROM patients WHERE user_id=$1 AND active=true', [userId]
  );
  return parseInt(r.rows[0].count);
}

async function findAguardandoRetornoVencidos(userId) {
  const r = await pool.query(
    `SELECT * FROM patients
     WHERE user_id=$1 AND active=true
       AND funil_etapa='Aguardando Retorno'
       AND updated_at < (NOW() AT TIME ZONE 'America/Sao_Paulo') - INTERVAL '2 days'`,
    [userId]
  );
  return r.rows;
}

async function findAniversariantesDoDia(userId) {
  const r = await pool.query(
    `SELECT * FROM patients
     WHERE user_id=$1 AND active=true AND birth_date IS NOT NULL
       AND EXTRACT(MONTH FROM birth_date) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND EXTRACT(DAY   FROM birth_date) = EXTRACT(DAY   FROM CURRENT_DATE)`,
    [userId]
  );
  return r.rows;
}

module.exports = {
  ETAPAS_FUNIL, findAll, findById, create, update, remove,
  updateFunilEtapa, avancarParaAgendamento, countActive,
  findAguardandoRetornoVencidos, findAniversariantesDoDia,
};
