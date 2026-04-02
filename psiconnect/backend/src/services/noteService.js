// Service de anotações clínicas

const noteModel        = require('../models/noteModel');
const appointmentModel = require('../models/appointmentModel');

async function listarPorConsulta(appointmentId, userId) {
  // Verifica se a consulta pertence ao usuário antes de mostrar as notas
  const consulta = await appointmentModel.findById(appointmentId, userId);
  if (!consulta) {
    const erro = new Error('Consulta não encontrada.');
    erro.status = 404;
    throw erro;
  }
  return await noteModel.findByAppointment(appointmentId);
}

async function historicoPorPaciente(patientId, userId) {
  return await noteModel.findByPatient(patientId, userId);
}

async function criar(appointmentId, userId, content) {
  if (!content) {
    const erro = new Error('O conteúdo da anotação é obrigatório.');
    erro.status = 400;
    throw erro;
  }
  const consulta = await appointmentModel.findById(appointmentId, userId);
  if (!consulta) {
    const erro = new Error('Consulta não encontrada.');
    erro.status = 404;
    throw erro;
  }
  return await noteModel.create(appointmentId, content);
}

async function atualizar(id, content) {
  if (!content) {
    const erro = new Error('O conteúdo da anotação é obrigatório.');
    erro.status = 400;
    throw erro;
  }
  const nota = await noteModel.update(id, content);
  if (!nota) {
    const erro = new Error('Anotação não encontrada.');
    erro.status = 404;
    throw erro;
  }
  return nota;
}

async function remover(id) {
  const nota = await noteModel.remove(id);
  if (!nota) {
    const erro = new Error('Anotação não encontrada.');
    erro.status = 404;
    throw erro;
  }
  return { message: 'Anotação removida.' };
}

module.exports = { listarPorConsulta, historicoPorPaciente, criar, atualizar, remover };
