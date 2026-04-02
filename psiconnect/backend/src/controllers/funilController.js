// Controller do funil de pacientes
const patientModel = require('../models/patientModel');

// GET /api/funil — retorna todos os pacientes agrupados por etapa
async function listar(req, res, next) {
  try {
    const pacientes = await patientModel.findAll(req.user.id, '');
    // Agrupa por etapa do funil
    const agrupado = {};
    patientModel.ETAPAS_FUNIL.forEach(e => { agrupado[e] = []; });
    pacientes.forEach(p => {
      if (agrupado[p.funil_etapa]) agrupado[p.funil_etapa].push(p);
    });
    return res.status(200).json(agrupado);
  } catch (e) { next(e); }
}

// PATCH /api/funil/:patientId/etapa — move o card para uma etapa
async function moverEtapa(req, res, next) {
  try {
    const { etapa } = req.body;
    if (!etapa || !patientModel.ETAPAS_FUNIL.includes(etapa)) {
      return res.status(400).json({ message: 'Etapa inválida.' });
    }
    const paciente = await patientModel.updateFunilEtapa(req.params.patientId, req.user.id, etapa);
    if (!paciente) return res.status(404).json({ message: 'Paciente não encontrado.' });
    return res.status(200).json({ message: 'Etapa atualizada!', paciente });
  } catch (e) { next(e); }
}

module.exports = { listar, moverEtapa };
