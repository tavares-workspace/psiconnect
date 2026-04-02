// Service de tarefas automáticas
const tarefaModel      = require('../models/tarefaModel');
const appointmentModel = require('../models/appointmentModel');
const patientModel     = require('../models/patientModel');

async function listarPendentes(userId) {
  return await tarefaModel.findPendentes(userId);
}

async function marcarFeita(id, userId) {
  const t = await tarefaModel.marcarFeita(id, userId);
  if (!t) { const e = new Error('Tarefa não encontrada.'); e.status = 404; throw e; }
  return t;
}

async function remover(id, userId) {
  const t = await tarefaModel.remove(id, userId);
  if (!t) { const e = new Error('Tarefa não encontrada.'); e.status = 404; throw e; }
  return { message: 'Tarefa removida.' };
}

// Verifica e gera tarefas automáticas
// Chamado no dashboard e ao concluir uma consulta
async function verificarEGerarTarefas(userId) {
  // 1. Consultas realizadas há mais de 1h sem prontuário
  const semProntuario = await appointmentModel.findSemProntuarioApos1h(userId);
  for (const c of semProntuario) {
    const jaExiste = await tarefaModel.existePendente(userId, c.patient_id, 'prontuario');
    if (!jaExiste) {
      await tarefaModel.create(
        userId,
        c.patient_id,
        `Preencher prontuário de ${c.patient_name}`,
        'prontuario'
      );
    }
  }

  // 2. Pacientes em "Aguardando Retorno" há mais de 2 dias
  const aguardando = await patientModel.findAguardandoRetornoVencidos(userId);
  for (const p of aguardando) {
    const jaExiste = await tarefaModel.existePendente(userId, p.id, 'retorno');
    if (!jaExiste) {
      await tarefaModel.create(
        userId,
        p.id,
        `${p.name} está aguardando retorno há mais de 2 dias`,
        'retorno'
      );
    }
  }
}

module.exports = { listarPendentes, marcarFeita, remover, verificarEGerarTarefas };
