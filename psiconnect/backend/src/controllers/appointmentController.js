// Controller de consultas

const appointmentService = require('../services/appointmentService');

async function list(req, res, next) {
  try {
    const { period, date, year, month, patientId } = req.query;
    const consultas = await appointmentService.listar(req.user.id, period, date, year, month, patientId);
    return res.status(200).json(consultas);
  } catch (erro) { next(erro); }
}

async function get(req, res, next) {
  try {
    const consulta = await appointmentService.buscarPorId(req.params.id, req.user.id);
    return res.status(200).json(consulta);
  } catch (erro) { next(erro); }
}

async function create(req, res, next) {
  try {
    const consulta = await appointmentService.criar(req.user.id, req.body);
    return res.status(201).json({ message: 'Consulta agendada!', consulta });
  } catch (erro) { next(erro); }
}

async function update(req, res, next) {
  try {
    const consulta = await appointmentService.atualizar(req.params.id, req.user.id, req.body);
    return res.status(200).json({ message: 'Consulta atualizada!', consulta });
  } catch (erro) { next(erro); }
}

async function cancel(req, res, next) {
  try {
    const consulta = await appointmentService.cancelar(req.params.id, req.user.id);
    return res.status(200).json({ message: 'Consulta cancelada.', consulta });
  } catch (erro) { next(erro); }
}

async function complete(req, res, next) {
  try {
    const consulta = await appointmentService.concluir(req.params.id, req.user.id);
    return res.status(200).json({ message: 'Consulta marcada como realizada.', consulta });
  } catch (erro) { next(erro); }
}

module.exports = { list, get, create, update, cancel, complete };
