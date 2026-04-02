// Service de pacientes
// Regras de negócio para cadastro e gerenciamento de pacientes

const patientModel = require('../models/patientModel');

async function listar(userId, search) {
  return await patientModel.findAll(userId, search);
}

async function buscarPorId(id, userId) {
  const paciente = await patientModel.findById(id, userId);
  if (!paciente) {
    const erro = new Error('Paciente não encontrado.');
    erro.status = 404;
    throw erro;
  }
  return paciente;
}

async function criar(userId, dados) {
  if (!dados.name) {
    const erro = new Error('O nome do paciente é obrigatório.');
    erro.status = 400;
    throw erro;
  }
  return await patientModel.create(
    userId, dados.name, dados.email, dados.phone,
    dados.birth_date, dados.cpf, dados.address, dados.notes
  );
}

async function atualizar(id, userId, dados) {
  if (!dados.name) {
    const erro = new Error('O nome do paciente é obrigatório.');
    erro.status = 400;
    throw erro;
  }
  const paciente = await patientModel.update(
    id, userId, dados.name, dados.email, dados.phone,
    dados.birth_date, dados.cpf, dados.address, dados.notes
  );
  if (!paciente) {
    const erro = new Error('Paciente não encontrado.');
    erro.status = 404;
    throw erro;
  }
  return paciente;
}

async function remover(id, userId) {
  const paciente = await patientModel.remove(id, userId);
  if (!paciente) {
    const erro = new Error('Paciente não encontrado.');
    erro.status = 404;
    throw erro;
  }
  return { message: 'Paciente removido com sucesso.' };
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
