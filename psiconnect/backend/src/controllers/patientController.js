// Controller de pacientes

const patientService = require('../services/patientService');

// GET /api/patients?search=nome
async function list(req, res, next) {
  try {
    const pacientes = await patientService.listar(req.user.id, req.query.search);
    return res.status(200).json(pacientes);
  } catch (erro) { next(erro); }
}

// GET /api/patients/:id
async function get(req, res, next) {
  try {
    const paciente = await patientService.buscarPorId(req.params.id, req.user.id);
    return res.status(200).json(paciente);
  } catch (erro) { next(erro); }
}

// POST /api/patients
async function create(req, res, next) {
  try {
    const paciente = await patientService.criar(req.user.id, req.body);
    return res.status(201).json({ message: 'Paciente cadastrado!', paciente });
  } catch (erro) { next(erro); }
}

// PUT /api/patients/:id
async function update(req, res, next) {
  try {
    const paciente = await patientService.atualizar(req.params.id, req.user.id, req.body);
    return res.status(200).json({ message: 'Paciente atualizado!', paciente });
  } catch (erro) { next(erro); }
}

// DELETE /api/patients/:id
async function remove(req, res, next) {
  try {
    const resultado = await patientService.remover(req.params.id, req.user.id);
    return res.status(200).json(resultado);
  } catch (erro) { next(erro); }
}

module.exports = { list, get, create, update, remove };
