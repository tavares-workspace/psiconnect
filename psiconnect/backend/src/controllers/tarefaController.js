// Controller de tarefas automáticas
const tarefaService = require('../services/tarefaService');

async function listar(req, res, next) {
  try {
    const tarefas = await tarefaService.listarPendentes(req.user.id);
    return res.status(200).json(tarefas);
  } catch (e) { next(e); }
}

async function marcarFeita(req, res, next) {
  try {
    const t = await tarefaService.marcarFeita(req.params.id, req.user.id);
    return res.status(200).json({ message: 'Tarefa concluída!', tarefa: t });
  } catch (e) { next(e); }
}

async function remover(req, res, next) {
  try {
    const r = await tarefaService.remover(req.params.id, req.user.id);
    return res.status(200).json(r);
  } catch (e) { next(e); }
}

async function verificar(req, res, next) {
  try {
    await tarefaService.verificarEGerarTarefas(req.user.id);
    const tarefas = await tarefaService.listarPendentes(req.user.id);
    return res.status(200).json(tarefas);
  } catch (e) { next(e); }
}

module.exports = { listar, marcarFeita, remover, verificar };
