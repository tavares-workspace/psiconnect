// Controller de lembretes

const reminderService = require('../services/reminderService');

async function list(req, res, next) {
  try {
    const lembretes = await reminderService.listar(req.user.id);
    return res.status(200).json(lembretes);
  } catch (erro) { next(erro); }
}

async function create(req, res, next) {
  try {
    const lembrete = await reminderService.criar(req.user.id, req.body);
    return res.status(201).json({ message: 'Lembrete criado!', lembrete });
  } catch (erro) { next(erro); }
}

async function update(req, res, next) {
  try {
    const lembrete = await reminderService.atualizar(req.params.id, req.user.id, req.body);
    return res.status(200).json({ message: 'Lembrete atualizado!', lembrete });
  } catch (erro) { next(erro); }
}

async function remove(req, res, next) {
  try {
    const resultado = await reminderService.remover(req.params.id, req.user.id);
    return res.status(200).json(resultado);
  } catch (erro) { next(erro); }
}

module.exports = { list, create, update, remove };
