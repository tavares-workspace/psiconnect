const appointmentService = require('../services/appointmentService');

async function listar(req, res, next) {
  try {
    const { period, date, year, month, patientId } = req.query;
    const consultas = await appointmentService.listar(req.user.id, period, date, year, month, patientId);
    return res.status(200).json(consultas);
  } catch (e) { next(e); }
}

async function buscarPorId(req, res, next) {
  try {
    const c = await appointmentService.buscarPorId(req.params.id, req.user.id);
    return res.status(200).json(c);
  } catch (e) { next(e); }
}

async function criar(req, res, next) {
  try {
    const resultado = await appointmentService.criar(req.user.id, req.body);
    return res.status(201).json({ message: 'Consulta agendada!', ...resultado });
  } catch (e) { next(e); }
}

async function atualizar(req, res, next) {
  try {
    const scope = req.query.scope || 'one';
    const resultado = await appointmentService.atualizar(req.params.id, req.user.id, req.body, scope);
    return res.status(200).json({ message: 'Consulta atualizada!', resultado });
  } catch (e) { next(e); }
}

async function cancelar(req, res, next) {
  try {
    const scope = req.query.scope || 'one';
    const resultado = await appointmentService.cancelar(req.params.id, req.user.id, scope);
    return res.status(200).json({ message: 'Consulta cancelada!', resultado });
  } catch (e) { next(e); }
}

async function concluir(req, res, next) {
  try {
    const c = await appointmentService.concluir(req.params.id, req.user.id);
    return res.status(200).json({ message: 'Consulta marcada como realizada!', consulta: c });
  } catch (e) { next(e); }
}

module.exports = { listar, buscarPorId, criar, atualizar, cancelar, concluir };
