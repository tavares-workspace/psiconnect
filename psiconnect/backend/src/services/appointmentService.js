// Service de consultas
// Lógica do funil automático:
// - Agendar com paciente em Interessado/Triagem → "Agendamento"
// - Agendar com paciente em "Primeira Sessão"   → "Paciente Ativo"
// - Marcar Realizada + paciente em "Agendamento" → "Primeira Sessão"
//
// Google Calendar:
// - Evento criado com nome "Sessão de Psicologia - [nome do paciente]"
// - Invite enviado ao e-mail do paciente quando disponível

const appointmentModel = require('../models/appointmentModel');
const patientModel     = require('../models/patientModel');
const userModel        = require('../models/userModel');
const calendarService  = require('./calendarService');

const ETAPAS = patientModel.ETAPAS_FUNIL;

async function listar(userId, periodo, data, ano, mes, patientId) {
  let dataInicio = null, dataFim = null;

  if (periodo === 'day' && data) {
    const d = new Date(data);
    dataInicio = new Date(d); dataInicio.setHours(0,0,0,0);
    dataFim    = new Date(d); dataFim.setHours(23,59,59,999);
  }
  if (periodo === 'week' && data) {
    const d = new Date(data); const dia = d.getDay();
    dataInicio = new Date(d); dataInicio.setDate(d.getDate()-dia);   dataInicio.setHours(0,0,0,0);
    dataFim    = new Date(d); dataFim.setDate(d.getDate()+(6-dia)); dataFim.setHours(23,59,59,999);
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

  // Busca paciente ANTES de criar a consulta (precisa do e-mail e da etapa)
  const paciente = await patientModel.findById(dados.patient_id, userId);
  if (!paciente) {
    const e = new Error('Paciente não encontrado.'); e.status = 404; throw e;
  }

  // Cria a consulta com duração fixa de 60 minutos
  const consulta = await appointmentModel.create(
    userId, dados.patient_id, dados.scheduled_at, dados.price
  );

  // Adiciona nome e e-mail do paciente no objeto para o Google Calendar
  consulta.patient_name  = paciente.name;
  consulta.patient_email = paciente.email || null;

  // ── Lógica do funil automático ──────────────────────────────────────────
  const etapaAtual = paciente.funil_etapa;
  const indexAtual = ETAPAS.indexOf(etapaAtual);

  if (etapaAtual === 'Primeira Sessão') {
    // Agendou de novo após a primeira sessão → já é Paciente Ativo
    await patientModel.updateFunilEtapa(dados.patient_id, userId, 'Paciente Ativo');
  } else if (indexAtual < ETAPAS.indexOf('Agendamento')) {
    // Estava em Interessado ou Triagem → avança para Agendamento
    await patientModel.updateFunilEtapa(dados.patient_id, userId, 'Agendamento');
  }
  // Se já está em Agendamento ou além (exceto Primeira Sessão), não mexe

  // ── Google Calendar ─────────────────────────────────────────────────────
  // Executa em background — não bloqueia a resposta se falhar
  criarEventoBackground(userId, consulta);

  return consulta;
}

// Cria o evento no Calendar de forma assíncrona sem bloquear a resposta
async function criarEventoBackground(userId, consulta) {
  try {
    const eventId = await calendarService.criarEvento(userId, consulta);
    if (eventId) {
      await appointmentModel.saveGoogleEventId(consulta.id, eventId);
    }
  } catch (err) {
    // Erro no Calendar nunca deve derrubar o agendamento
    console.error('[Agendamento] Erro ao criar evento no Calendar:', err.message);
  }
}

async function atualizar(id, userId, dados) {
  if (!dados.patient_id || !dados.scheduled_at) {
    const e = new Error('Paciente e data/hora são obrigatórios.'); e.status = 400; throw e;
  }

  const consulta = await appointmentModel.update(
    id, userId, dados.patient_id, dados.scheduled_at, dados.status, dados.price
  );
  if (!consulta) { const e = new Error('Consulta não encontrada.'); e.status = 404; throw e; }

  // Busca e-mail do paciente para o invite atualizado
  const paciente = await patientModel.findById(dados.patient_id, userId);
  if (paciente) {
    consulta.patient_name  = paciente.name;
    consulta.patient_email = paciente.email || null;
  }

  // Atualiza evento no Calendar em background
  if (consulta.google_event_id) {
    calendarService.atualizarEvento(userId, consulta).catch(err => {
      console.error('[Agendamento] Erro ao atualizar evento no Calendar:', err.message);
    });
  }

  return consulta;
}

async function cancelar(id, userId) {
  const consulta = await appointmentModel.updateStatus(id, userId, 'cancelled');
  if (!consulta) { const e = new Error('Consulta não encontrada.'); e.status = 404; throw e; }

  if (consulta.google_event_id) {
    calendarService.deletarEvento(userId, consulta.google_event_id).catch(err => {
      console.error('[Agendamento] Erro ao cancelar evento no Calendar:', err.message);
    });
  }

  return consulta;
}

async function concluir(id, userId) {
  const consulta = await appointmentModel.updateStatus(id, userId, 'completed');
  if (!consulta) { const e = new Error('Consulta não encontrada.'); e.status = 404; throw e; }

  // Marcar como realizada + paciente em "Agendamento" → move para "Primeira Sessão"
  const paciente = await patientModel.findById(consulta.patient_id, userId);
  if (paciente && paciente.funil_etapa === 'Agendamento') {
    await patientModel.updateFunilEtapa(consulta.patient_id, userId, 'Primeira Sessão');
  }

  return consulta;
}

module.exports = { listar, buscarPorId, criar, atualizar, cancelar, concluir };
