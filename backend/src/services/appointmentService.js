const { v4: uuidv4 }   = require('uuid');
const appointmentModel = require('../models/appointmentModel');
const patientModel     = require('../models/patientModel');
const tarefaModel      = require('../models/tarefaModel');
const calendarService  = require('./calendarService');

const ETAPAS = patientModel.ETAPAS_FUNIL;

// Soma dias a uma string ISO sem converter timezone
// Ex: "2026-05-09T09:00" + 7 dias = "2026-05-16T09:00"
function somarDias(isoString, dias) {
  const d = new Date(isoString);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString();
}

function calcularDatasRecorrencia(scheduledAt, tipo) {
  const datas     = [];
  let intervalo   = 0;
  let total       = 0;

  if (tipo === 'semanal')   { intervalo = 7;  total = 12; }
  if (tipo === 'quinzenal') { intervalo = 15; total = 6;  }
  if (tipo === 'mensal')    { intervalo = 30; total = 6;  }

  for (let i = 1; i <= total; i++) {
    datas.push(somarDias(scheduledAt, intervalo * i));
  }
  return datas;
}

async function listar(userId, periodo, data, ano, mes, patientId) {
  let dataInicio = null, dataFim = null;

  if (periodo === 'day' && data) {
    const d = new Date(data + 'T12:00:00');
    dataInicio = new Date(d); dataInicio.setHours(0,0,0,0);
    dataFim    = new Date(d); dataFim.setHours(23,59,59,999);
  }
  if (periodo === 'week' && data) {
    const d   = new Date(data + 'T12:00:00');
    const dia = d.getDay();
    dataInicio = new Date(d); dataInicio.setDate(d.getDate() - dia);  dataInicio.setHours(0,0,0,0);
    dataFim    = new Date(d); dataFim.setDate(d.getDate() + (6-dia)); dataFim.setHours(23,59,59,999);
  }
  if (periodo === 'month' && ano && mes) {
    dataInicio = new Date(ano, mes-1, 1, 0,0,0);
    dataFim    = new Date(ano, mes,   0, 23,59,59);
  }

  return await appointmentModel.findAll(userId, dataInicio, dataFim, patientId);
}

async function buscarPorId(id, userId) {
  const c = await appointmentModel.findById(id, userId);
  if (!c) { const e = new Error('Consulta não encontrada.'); e.status = 404; throw e; }
  return c;
}

async function criar(userId, dados) {
  if (!dados.patient_id || !dados.scheduled_at) {
    const e = new Error('Paciente e data/hora são obrigatórios.'); e.status = 400; throw e;
  }

  const paciente = await patientModel.findById(dados.patient_id, userId);
  if (!paciente) { const e = new Error('Paciente não encontrado.'); e.status = 404; throw e; }

  const recorrenciaTipo = dados.recorrencia || null;
  const recorrenciaId   = recorrenciaTipo ? uuidv4() : null;

  const consulta = await appointmentModel.create(
    userId, dados.patient_id, dados.scheduled_at, recorrenciaId, recorrenciaTipo
  );
  consulta.patient_name  = paciente.name;
  consulta.patient_email = paciente.email || null;

  const etapaAtual = paciente.funil_etapa;
  const indexAtual = ETAPAS.indexOf(etapaAtual);
  if (etapaAtual === 'Primeira Sessão') {
    await patientModel.updateFunilEtapa(dados.patient_id, userId, 'Paciente Ativo');
  } else if (indexAtual < ETAPAS.indexOf('Agendamento')) {
    await patientModel.updateFunilEtapa(dados.patient_id, userId, 'Agendamento');
  }

  const consultasRecorrentes = [];
  if (recorrenciaTipo) {
    const datas = calcularDatasRecorrencia(dados.scheduled_at, recorrenciaTipo);
    for (const data of datas) {
      const c = await appointmentModel.create(
        userId, dados.patient_id, data, recorrenciaId, recorrenciaTipo
      );
      c.patient_name  = paciente.name;
      c.patient_email = paciente.email || null;
      consultasRecorrentes.push(c);
    }
  }

  criarEventosBackground(userId, consulta, consultasRecorrentes);

  return { consulta, recorrentes: consultasRecorrentes.length };
}

async function criarEventosBackground(userId, consulta, recorrentes) {
  try {
    const eventId = await calendarService.criarEvento(userId, consulta);
    if (eventId) await appointmentModel.saveGoogleEventId(consulta.id, eventId);

    for (const c of recorrentes) {
      const eId = await calendarService.criarEvento(userId, c);
      if (eId) await appointmentModel.saveGoogleEventId(c.id, eId);
    }
  } catch (err) {
    console.error('[Agendamento] calendar error:', err.message);
  }
}

async function atualizar(id, userId, dados, scope) {
  if (!dados.patient_id || !dados.scheduled_at) {
    const e = new Error('Paciente e data/hora são obrigatórios.'); e.status = 400; throw e;
  }

  const consulta = await appointmentModel.findById(id, userId);
  if (!consulta) { const e = new Error('Consulta não encontrada.'); e.status = 404; throw e; }

  const paciente = await patientModel.findById(dados.patient_id, userId);

  if (scope === 'all' && consulta.recorrencia_id) {
    const atualizados = await appointmentModel.updateAllRecorrencia(
      consulta.recorrencia_id, userId, dados.patient_id, dados.scheduled_at
    );
    for (const a of atualizados) {
      if (a.google_event_id) {
        a.patient_name  = paciente?.name;
        a.patient_email = paciente?.email;
        calendarService.atualizarEvento(userId, a).catch(() => {});
      }
    }
    return { atualizados: atualizados.length, scope: 'all' };
  }

  const atualizado = await appointmentModel.update(
    id, userId, dados.patient_id, dados.scheduled_at, dados.status || consulta.status
  );
  if (atualizado?.google_event_id && paciente) {
    atualizado.patient_name  = paciente.name;
    atualizado.patient_email = paciente.email;
    calendarService.atualizarEvento(userId, atualizado).catch(() => {});
  }
  return atualizado;
}

async function cancelar(id, userId, scope) {
  const consulta = await appointmentModel.findById(id, userId);
  if (!consulta) { const e = new Error('Consulta não encontrada.'); e.status = 404; throw e; }

  if (scope === 'all' && consulta.recorrencia_id) {
    const cancelados = await appointmentModel.cancelAllRecorrencia(consulta.recorrencia_id, userId);
    for (const c of cancelados) {
      const appt = await appointmentModel.findById(c.id, userId);
      if (appt?.google_event_id) {
        calendarService.deletarEvento(userId, appt.google_event_id).catch(() => {});
      }
    }
    return { cancelados: cancelados.length, scope: 'all' };
  }

  const cancelado = await appointmentModel.cancelOne(id, userId);
  if (cancelado?.google_event_id) {
    calendarService.deletarEvento(userId, cancelado.google_event_id).catch(() => {});
  }
  return cancelado;
}

async function concluir(id, userId) {
  const consulta = await appointmentModel.updateStatus(id, userId, 'completed');
  if (!consulta) { const e = new Error('Consulta não encontrada.'); e.status = 404; throw e; }

  const paciente = await patientModel.findById(consulta.patient_id, userId);

  if (paciente && paciente.funil_etapa === 'Agendamento') {
    await patientModel.updateFunilEtapa(consulta.patient_id, userId, 'Primeira Sessão');
  }

  const jaExiste = await tarefaModel.existePendente(userId, consulta.patient_id, 'prontuario');
  if (!jaExiste) {
    await tarefaModel.create(
      userId,
      consulta.patient_id,
      `Preencher prontuário de ${paciente?.name || 'paciente'}`,
      'prontuario'
    );
  }

  return consulta;
}

module.exports = { listar, buscarPorId, criar, atualizar, cancelar, concluir };
