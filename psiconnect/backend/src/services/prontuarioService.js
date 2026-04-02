// Service de prontuários
const prontuarioModel = require('../models/prontuarioModel');
const patientModel    = require('../models/patientModel');

async function buscar(patientId, userId) {
  // Verifica se o paciente pertence ao usuário
  const paciente = await patientModel.findById(patientId, userId);
  if (!paciente) {
    const e = new Error('Paciente não encontrado.'); e.status = 404; throw e;
  }
  return await prontuarioModel.findDecrypted(patientId);
}

async function salvar(patientId, userId, evolucao, contratoPath, contratoNome) {
  const paciente = await patientModel.findById(patientId, userId);
  if (!paciente) {
    const e = new Error('Paciente não encontrado.'); e.status = 404; throw e;
  }
  return await prontuarioModel.upsert(patientId, evolucao, contratoPath, contratoNome);
}

module.exports = { buscar, salvar };
