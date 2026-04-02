// Model de prontuários
// Evolução clínica criptografada com AES simples via Node.js (crypto nativo)
// Mais simples e confiável que pgcrypto para este caso

const pool   = require('../config/database');
const crypto = require('crypto');

// Algoritmo e chave de criptografia
const ALGORITHM = 'aes-256-cbc';

// Deriva uma chave de 32 bytes a partir da CRYPTO_KEY do .env
function getKey() {
  return crypto.scryptSync(process.env.CRYPTO_KEY || 'chave_padrao_psiconnect', 'salt_psi', 32);
}

// Criptografa um texto — retorna string "iv:textoEncriptado" em hex
function encrypt(text) {
  if (!text) return '';
  const iv        = crypto.randomBytes(16);
  const cipher    = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  // Retorna iv e conteúdo separados por ":" em hex
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Descriptografa — recebe "iv:textoEncriptado" em hex
function decrypt(encryptedText) {
  if (!encryptedText) return '';
  try {
    const [ivHex, encHex] = encryptedText.split(':');
    const iv       = Buffer.from(ivHex, 'hex');
    const enc      = Buffer.from(encHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    const decrypted = Buffer.concat([decipher.update(enc), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    return ''; // se falhar na descriptografia, retorna vazio
  }
}

// Busca prontuário e descriptografa a evolução
async function findDecrypted(patientId) {
  const r = await pool.query(
    'SELECT * FROM prontuarios WHERE patient_id = $1',
    [patientId]
  );
  if (!r.rows[0]) return null;

  const p = r.rows[0];
  return {
    ...p,
    evolucao: decrypt(p.evolucao_encrypted), // descriptografa para exibir
  };
}

// Salva ou atualiza o prontuário (upsert)
async function upsert(patientId, evolucao, contratoPath, contratoNome) {
  const evolucaoEncrypted = encrypt(evolucao || '');

  const r = await pool.query(
    `INSERT INTO prontuarios (patient_id, evolucao_encrypted, contrato_path, contrato_nome)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (patient_id) DO UPDATE
       SET evolucao_encrypted = $2,
           contrato_path = COALESCE($3, prontuarios.contrato_path),
           contrato_nome = COALESCE($4, prontuarios.contrato_nome),
           updated_at = NOW()
     RETURNING id, patient_id, contrato_path, contrato_nome, updated_at`,
    [patientId, evolucaoEncrypted, contratoPath || null, contratoNome || null]
  );
  return r.rows[0];
}

module.exports = { findDecrypted, upsert, encrypt, decrypt };
