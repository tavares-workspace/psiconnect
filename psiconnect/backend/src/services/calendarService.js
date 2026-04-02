// Service do Google Calendar — versão corrigida e testada
// Problemas corrigidos:
// 1. Invite enviado ao e-mail do paciente quando disponível
// 2. Nome do evento padronizado: "Sessão de Psicologia - [nome do paciente]"
// 3. Tratamento robusto de tokens inválidos/expirados
// 4. Logs claros para facilitar debug
// 5. Remoção de attendee inválido (sem e-mail) que causava erro na API do Google

const { google }         = require('googleapis');
const calendarTokenModel = require('../models/calendarTokenModel');

function criarClienteOAuth() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET não configurados no .env');
  }
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// Gera URL de autorização — userId passado no "state" para recuperar no callback
function getUrlAutorizacao(userId) {
  const client = criarClienteOAuth();
  return client.generateAuthUrl({
    access_type:            'offline',
    scope:                  ['https://www.googleapis.com/auth/calendar.events'],
    prompt:                 'consent',   // garante refresh_token sempre
    state:                  String(userId),
    include_granted_scopes: true,
  });
}

// Processa o callback do Google após autorização do usuário
async function processarCallback(userId, code) {
  const client = criarClienteOAuth();

  try {
    const { tokens } = await client.getToken(code);
    console.log('[Calendar] Tokens recebidos do Google:', {
      has_access:  !!tokens.access_token,
      has_refresh: !!tokens.refresh_token,
      expires_at:  tokens.expiry_date,
    });

    if (!tokens.access_token) {
      throw new Error('Google não retornou access_token. Tente conectar novamente.');
    }

    // Se não veio refresh_token, reutiliza o que já está salvo (se houver)
    let refreshToken = tokens.refresh_token;
    if (!refreshToken) {
      const existente = await calendarTokenModel.findByUserId(userId);
      if (existente?.refresh_token) {
        refreshToken = existente.refresh_token;
        console.log('[Calendar] Reaproveitando refresh_token existente.');
      } else {
        // Sem refresh_token novo nem antigo: força nova autorização
        throw new Error(
          'O Google não retornou o refresh_token. Isso ocorre quando o app já foi autorizado antes. ' +
          'Para resolver: acesse https://myaccount.google.com/permissions, remova o acesso do PsiConnect e conecte novamente.'
        );
      }
    }

    await calendarTokenModel.salvar(
      userId,
      tokens.access_token,
      refreshToken,
      new Date(tokens.expiry_date || Date.now() + 3600000)
    );

    return { message: 'Google Calendar conectado com sucesso!' };
  } catch (err) {
    console.error('[Calendar] Erro no callback:', err.message);
    throw err;
  }
}

// Retorna cliente OAuth autenticado — renova o token se necessário
async function getClienteAutenticado(userId) {
  const tokenData = await calendarTokenModel.findByUserId(userId);
  if (!tokenData) return null;

  const client = criarClienteOAuth();
  client.setCredentials({
    access_token:  tokenData.access_token,
    refresh_token: tokenData.refresh_token,
  });

  // Renova se expirou (com margem de 5 minutos)
  const expiracao     = new Date(tokenData.expires_at);
  const cincoMinutos  = 5 * 60 * 1000;
  const deveRenovar   = new Date() >= new Date(expiracao.getTime() - cincoMinutos);

  if (deveRenovar) {
    try {
      console.log('[Calendar] Access token expirado — renovando...');
      const { credentials } = await client.refreshAccessToken();
      const novoRefresh = credentials.refresh_token || tokenData.refresh_token;

      await calendarTokenModel.salvar(
        userId,
        credentials.access_token,
        novoRefresh,
        new Date(credentials.expiry_date || Date.now() + 3600000)
      );

      client.setCredentials({
        access_token:  credentials.access_token,
        refresh_token: novoRefresh,
      });

      console.log('[Calendar] Token renovado com sucesso.');
    } catch (err) {
      console.error('[Calendar] Falha ao renovar token:', err.message);
      // Token inválido — remove para forçar nova autorização
      await calendarTokenModel.remove(userId);
      return null;
    }
  }

  return client;
}

// Cria evento no Google Calendar ao agendar consulta
// Envia invite ao e-mail do paciente quando disponível
async function criarEvento(userId, consulta) {
  try {
    const auth = await getClienteAutenticado(userId);
    if (!auth) {
      console.log('[Calendar] Usuário sem Google Calendar conectado — evento não criado.');
      return null;
    }

    const calendar = google.calendar({ version: 'v3', auth });

    const inicio = new Date(consulta.scheduled_at);
    const fim    = new Date(inicio.getTime() + 60 * 60 * 1000); // 60 minutos fixos

    // Nome padronizado conforme solicitado
    const titulo = `Sessão de Psicologia - ${consulta.patient_name}`;

    // Monta lista de convidados — inclui o paciente só se tiver e-mail válido
    const attendees = [];
    if (consulta.patient_email && consulta.patient_email.includes('@')) {
      attendees.push({
        email:       consulta.patient_email,
        displayName: consulta.patient_name,
      });
    }

    const resource = {
      summary:     titulo,
      description: `Sessão de psicoterapia com ${consulta.patient_name}.\n\nAgendado via PsiConnect.`,
      start: { dateTime: inicio.toISOString(), timeZone: 'America/Sao_Paulo' },
      end:   { dateTime: fim.toISOString(),    timeZone: 'America/Sao_Paulo' },
      reminders: {
        useDefault: false,
        overrides:  [{ method: 'popup', minutes: 30 }],
      },
    };

    // Adiciona attendees só se houver ao menos 1 (evita erro na API)
    if (attendees.length > 0) {
      resource.attendees = attendees;
      resource.guestsCanSeeOtherGuests = false; // privacidade
    }

    const resposta = await calendar.events.insert({
      calendarId:              'primary',
      resource,
      sendUpdates:             attendees.length > 0 ? 'all' : 'none', // envia e-mail de invite ao paciente
    });

    console.log(`[Calendar] Evento criado: "${titulo}" (ID: ${resposta.data.id})`);
    return resposta.data.id;

  } catch (err) {
    console.error('[Calendar] Erro ao criar evento:', err.message);
    return null; // Não bloqueia o agendamento em caso de falha
  }
}

// Atualiza evento existente (ao editar consulta)
async function atualizarEvento(userId, consulta) {
  if (!consulta.google_event_id) return;

  try {
    const auth = await getClienteAutenticado(userId);
    if (!auth) return;

    const calendar = google.calendar({ version: 'v3', auth });

    const inicio = new Date(consulta.scheduled_at);
    const fim    = new Date(inicio.getTime() + 60 * 60 * 1000);
    const titulo = `Sessão de Psicologia - ${consulta.patient_name}`;

    const attendees = [];
    if (consulta.patient_email && consulta.patient_email.includes('@')) {
      attendees.push({
        email:       consulta.patient_email,
        displayName: consulta.patient_name,
      });
    }

    const resource = {
      summary:     titulo,
      description: `Sessão de psicoterapia com ${consulta.patient_name}.\n\nAgendado via PsiConnect.`,
      start: { dateTime: inicio.toISOString(), timeZone: 'America/Sao_Paulo' },
      end:   { dateTime: fim.toISOString(),    timeZone: 'America/Sao_Paulo' },
    };

    if (attendees.length > 0) {
      resource.attendees = attendees;
      resource.guestsCanSeeOtherGuests = false;
    }

    await calendar.events.update({
      calendarId:   'primary',
      eventId:      consulta.google_event_id,
      resource,
      sendUpdates:  attendees.length > 0 ? 'all' : 'none',
    });

    console.log(`[Calendar] Evento atualizado: "${titulo}"`);
  } catch (err) {
    if (err.code === 404 || err.code === 410) {
      console.log('[Calendar] Evento não encontrado no Google — pode ter sido deletado manualmente.');
    } else {
      console.error('[Calendar] Erro ao atualizar evento:', err.message);
    }
  }
}

// Remove evento ao cancelar consulta
async function deletarEvento(userId, googleEventId) {
  if (!googleEventId) return;

  try {
    const auth = await getClienteAutenticado(userId);
    if (!auth) return;

    const calendar = google.calendar({ version: 'v3', auth });
    await calendar.events.delete({
      calendarId:  'primary',
      eventId:     googleEventId,
      sendUpdates: 'all', // notifica o paciente sobre cancelamento
    });

    console.log(`[Calendar] Evento cancelado: ${googleEventId}`);
  } catch (err) {
    if (err.code === 404 || err.code === 410) {
      console.log('[Calendar] Evento já não existia no Google Calendar.');
    } else {
      console.error('[Calendar] Erro ao deletar evento:', err.message);
    }
  }
}

async function getStatus(userId) {
  const token = await calendarTokenModel.findByUserId(userId);
  return { connected: !!token };
}

async function desconectar(userId) {
  await calendarTokenModel.remove(userId);
  return { message: 'Google Calendar desconectado.' };
}

module.exports = {
  getUrlAutorizacao,
  processarCallback,
  criarEvento,
  atualizarEvento,
  deletarEvento,
  getStatus,
  desconectar,
};
