
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
  const atual = await reminderModel.findById(id, userId);
  if (!atual) {
    const erro = new Error('Lembrete não encontrado.'); erro.status = 404; throw erro;
  }
  const lembrete = await reminderModel.update(
    id, userId,
    dados.title      ?? atual.title,
    dados.description ?? atual.description,
    dados.remind_at  ?? atual.remind_at,
    dados.done       ?? atual.done
  );
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
