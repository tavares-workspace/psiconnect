// Model de usuários

const pool = require('../config/database');

// Busca um usuário pelo e-mail
// Usado no login para verificar se o e-mail existe
async function findByEmail(email) {
  const resultado = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  // rows[0] retorna o primeiro (e único) resultado, ou undefined se não encontrou
  return resultado.rows[0] || null;
}

// Busca um usuário pelo ID
// Usado para retornar os dados do perfil (sem a senha)
async function findById(id) {
  const resultado = await pool.query(
    'SELECT id, name, email, crp, phone, created_at FROM users WHERE id = $1',
    [id]
  );
  return resultado.rows[0] || null;
}

// Cria um novo usuário no banco
// O password_hash já vem criptografado pelo service
async function create(name, email, passwordHash, crp, phone) {
  const resultado = await pool.query(
    `INSERT INTO users (name, email, password_hash, crp, phone)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, crp, phone, created_at`,
    [name, email, passwordHash, crp || null, phone || null]
  );
  return resultado.rows[0];
}

// Atualiza os dados do perfil do usuário
async function update(id, name, crp, phone) {
  const resultado = await pool.query(
    `UPDATE users
     SET name = $1, crp = $2, phone = $3
     WHERE id = $4
     RETURNING id, name, email, crp, phone`,
    [name, crp || null, phone || null, id]
  );
  return resultado.rows[0] || null;
}

// Atualiza só a senha do usuário
async function updatePassword(id, passwordHash) {
  await pool.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [passwordHash, id]
  );
}

module.exports = { findByEmail, findById, create, update, updatePassword };
