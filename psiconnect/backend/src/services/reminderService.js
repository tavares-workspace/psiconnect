// Service de lembretes

const reminderModel = require('../models/reminderModel');

async function listar(userId) {
  return await reminderModel.findAll(userId);
}

async function criar(userId, dados) {
  if (!dados.title || !dados.remind_at) {
    const erro = new Error('Título e data são obrigatórios.');
    erro.status = 400;
    throw erro;
  }
  return await reminderModel.create(userId, dados.title, dados.description, dados.remind_at);
}

async function atualizar(id, userId, dados) {
  if (!dados.title || !dados.remind_at) {
    const erro = new Error('Título e data são obrigatórios.');
    erro.status = 400;
    throw erro;
  }
  const lembrete = await reminderModel.update(id, userId, dados.title, dados.description, dados.remind_at, dados.done ?? false);
  if (!lembrete) {
    const erro = new Error('Lembrete não encontrado.');
    erro.status = 404;
    throw erro;
  }
  return lembrete;
}

async function remover(id, userId) {
  const lembrete = await reminderModel.remove(id, userId);
  if (!lembrete) {
    const erro = new Error('Lembrete não encontrado.');
    erro.status = 404;
    throw erro;
  }
  return { message: 'Lembrete removido.' };
}

module.exports = { listar, criar, atualizar, remover };
