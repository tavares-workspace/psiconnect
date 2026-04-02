// Model de pacientes — atualizado com etapa do funil
const pool = require('../config/database');

// Etapas válidas do funil, em ordem
const ETAPAS_FUNIL = [
  'Interessado',
  'Triagem',
  'Agendamento',
  'Primeira Sessão',
  'Paciente Ativo',
  'Aguardando Retorno',
  'Alta/Encerrado',
  'Abandono',
];

async function findAll(userId, search) {
  if (search) {
    const r = await pool.query(
      `SELECT * FROM patients
       WHERE user_id = $1 AND active = true
         AND (name ILIKE $2 OR email ILIKE $2 OR phone ILIKE $2)
       ORDER BY name`,
      [userId, '%' + search + '%']
    );
    return r.rows;
  }
  const r = await pool.query(
    'SELECT * FROM patients WHERE user_id = $1 AND active = true ORDER BY name',
    [userId]
  );
  return r.rows;
}

async function findById(id, userId) {
  const r = await pool.query(
    'SELECT * FROM patients WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return r.rows[0] || null;
}

async function create(userId, name, email, phone, birthDate, cpf, address, notes) {
  const r = await pool.query(
    `INSERT INTO patients (user_id, name, email, phone, birth_date, cpf, address, notes, funil_etapa)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Interessado')
     RETURNING *`,
    [userId, name, email||null, phone||null, birthDate||null, cpf||null, address||null, notes||null]
  );
  return r.rows[0];
}

async function update(id, userId, name, email, phone, birthDate, cpf, address, notes) {
  const r = await pool.query(
    `UPDATE patients
     SET name=$1, email=$2, phone=$3, birth_date=$4, cpf=$5, address=$6, notes=$7
     WHERE id=$8 AND user_id=$9
     RETURNING *`,
    [name, email||null, phone||null, birthDate||null, cpf||null, address||null, notes||null, id, userId]
  );
  return r.rows[0] || null;
}

// Atualiza a etapa do funil — verifica se deve avançar ou manter
async function updateFunilEtapa(id, userId, novaEtapa) {
  const r = await pool.query(
    'UPDATE patients SET funil_etapa=$1 WHERE id=$2 AND user_id=$3 RETURNING *',
    [novaEtapa, id, userId]
  );
  return r.rows[0] || null;
}

// Avança para "Agendamento" apenas se o paciente estiver antes dessa etapa
async function avancarParaAgendamento(id, userId) {
  const paciente = await findById(id, userId);
  if (!paciente) return null;

  const indexAtual   = ETAPAS_FUNIL.indexOf(paciente.funil_etapa);
  const indexAlvo    = ETAPAS_FUNIL.indexOf('Agendamento');

  // Só avança se estiver antes de "Agendamento"
  if (indexAtual < indexAlvo) {
    return await updateFunilEtapa(id, userId, 'Agendamento');
  }

  // Se já está em "Agendamento" ou além, não mexe
  return paciente;
}

async function remove(id, userId) {
  const r = await pool.query(
    'UPDATE patients SET active=false WHERE id=$1 AND user_id=$2 RETURNING id',
    [id, userId]
  );
  return r.rows[0] || null;
}

async function countActive(userId) {
  const r = await pool.query(
    'SELECT COUNT(*) FROM patients WHERE user_id=$1 AND active=true',
    [userId]
  );
  return parseInt(r.rows[0].count);
}

// Busca pacientes em "Aguardando Retorno" há mais de 2 dias (para gerar lembretes)
async function findAguardandoRetornoVencidos(userId) {
  const r = await pool.query(
    `SELECT * FROM patients
     WHERE user_id=$1 AND active=true AND funil_etapa='Aguardando Retorno'
       AND updated_at < NOW() - INTERVAL '2 days'`,
    [userId]
  );
  return r.rows;
}

module.exports = {
  ETAPAS_FUNIL,
  findAll, findById, create, update, updateFunilEtapa,
  avancarParaAgendamento, remove, countActive, findAguardandoRetornoVencidos,
};
