// Controller do dashboard

const dashboardService = require('../services/dashboardService');

async function getDashboard(req, res, next) {
  try {
    const dados = await dashboardService.getDados(req.user.id);
    return res.status(200).json(dados);
  } catch (erro) { next(erro); }
}

module.exports = { getDashboard };
