// Controller de anotações clínicas

const noteService = require('../services/noteService');

async function listByAppointment(req, res, next) {
  try {
    const notas = await noteService.listarPorConsulta(req.params.appointmentId, req.user.id);
    return res.status(200).json(notas);
  } catch (erro) { next(erro); }
}

async function listByPatient(req, res, next) {
  try {
    const historico = await noteService.historicoPorPaciente(req.params.patientId, req.user.id);
    return res.status(200).json(historico);
  } catch (erro) { next(erro); }
}

async function create(req, res, next) {
  try {
    const nota = await noteService.criar(req.params.appointmentId, req.user.id, req.body.content);
    return res.status(201).json({ message: 'Anotação criada!', nota });
  } catch (erro) { next(erro); }
}

async function update(req, res, next) {
  try {
    const nota = await noteService.atualizar(req.params.id, req.body.content);
    return res.status(200).json({ message: 'Anotação atualizada!', nota });
  } catch (erro) { next(erro); }
}

async function remove(req, res, next) {
  try {
    const resultado = await noteService.remover(req.params.id);
    return res.status(200).json(resultado);
  } catch (erro) { next(erro); }
}

module.exports = { listByAppointment, listByPatient, create, update, remove };
