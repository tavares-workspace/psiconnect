const pool = require('../config/database');

async function findByEmail(email) {
  const r = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return r.rows[0] || null;
}

async function findById(id) {
  const r = await pool.query(
    'SELECT id, name, email, crp, phone, created_at, aceite_termos FROM users WHERE id = $1',
    [id]
  );
  return r.rows[0] || null;
}

async function create(name, email, passwordHash, crp, phone) {
  const r = await pool.query(
    `INSERT INTO users (name, email, password_hash, crp, phone, aceite_termos)
     VALUES ($1, $2, $3, $4, $5, true)
     RETURNING id, name, email, crp, phone, created_at, aceite_termos`,
    [name, email, passwordHash, crp || null, phone || null]
  );
  return r.rows[0];
}

async function update(id, name, crp, phone) {
  const r = await pool.query(
    `UPDATE users SET name=$1, crp=$2, phone=$3 WHERE id=$4
     RETURNING id, name, email, crp, phone`,
    [name, crp || null, phone || null, id]
  );
  return r.rows[0] || null;
}

async function updatePassword(id, passwordHash) {
  await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [passwordHash, id]);
}

// Anonimiza o usuário conforme LGPD — mantém o registro para preservar métricas
async function anonimizar(id) {
  const emailAnonimo = `removido_${id}@anonimo.psiconnect`;
  const hashFake     = '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

  await pool.query(
    `UPDATE users
     SET name          = 'Usuário removido',
         email         = $1,
         password_hash = $2,
         crp           = null,
         phone         = null
     WHERE id = $3`,
    [emailAnonimo, hashFake, id]
  );
}

// Remove todos os dados clínicos e pessoais dos pacientes do usuário
async function removerDadosPacientes(userId) {
  // Apaga prontuários
  await pool.query(
    `DELETE FROM prontuarios WHERE patient_id IN
     (SELECT id FROM patients WHERE user_id = $1)`,
    [userId]
  );
  // Apaga anotações
  await pool.query(
    `DELETE FROM appointment_notes WHERE appointment_id IN
     (SELECT id FROM appointments WHERE user_id = $1)`,
    [userId]
  );
  // Anonimiza pacientes — mantém para não quebrar FK de appointments
  await pool.query(
    `UPDATE patients
     SET name       = 'Paciente removido',
         email      = null,
         phone      = null,
         cpf        = null,
         address    = null,
         notes      = null,
         birth_date = null
     WHERE user_id = $1`,
    [userId]
  );
  // Remove tarefas, lembretes e tokens do Calendar
  await pool.query('DELETE FROM tarefas WHERE user_id = $1', [userId]);
  await pool.query('DELETE FROM reminders WHERE user_id = $1', [userId]);
  await pool.query('DELETE FROM google_calendar_tokens WHERE user_id = $1', [userId]);
}

module.exports = { findByEmail, findById, create, update, updatePassword, anonimizar, removerDadosPacientes };
