// Service do dashboard — inclui métricas para gráficos e tarefas automáticas
const patientModel     = require('../models/patientModel');
const appointmentModel = require('../models/appointmentModel');
const reminderModel    = require('../models/reminderModel');
const tarefaService    = require('./tarefaService');

async function getDados(userId) {
  // Verifica e gera tarefas automáticas ao abrir o dashboard
  await tarefaService.verificarEGerarTarefas(userId);

  const [
    totalPacientes,
    proximasConsultas,
    ultimosAtendimentos,
    lembretesHoje,
    contadores,
    graficoPorMes,
    tarefas,
  ] = await Promise.all([
    patientModel.countActive(userId),
    appointmentModel.findProximas(userId, 5),
    appointmentModel.findRecentes(userId, 5),
    reminderModel.findHoje(userId),
    appointmentModel.countsByStatus(userId),
    appointmentModel.countsPorMes(userId),
    tarefaService.listarPendentes(userId),
  ]);

  return {
    totalPacientes,
    proximasConsultas,
    ultimosAtendimentos,
    lembretesHoje,
    contadores,   // agendadas, realizadas, canceladas, hoje, semana
    graficoPorMes,
    tarefas,
  };
}

module.exports = { getDados };
