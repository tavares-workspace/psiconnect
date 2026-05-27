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

function getUrlAutorizacao(userId) {
  const client = criarClienteOAuth();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    prompt: 'consent',
    state: String(userId),
    include_granted_scopes: true,
  });
}

async function processarCallback(userId, code) {
  const client = criarClienteOAuth();
  try {
    const { tokens } = await client.getToken(code);
    if (!tokens.access_token) throw new Error('Google não retornou access_token.');

    let refreshToken = tokens.refresh_token;
    if (!refreshToken) {
      const existente = await calendarTokenModel.findByUserId(userId);
      if (existente?.refresh_token) refreshToken = existente.refresh_token;
      else throw new Error('Token não retornado. Acesse myaccount.google.com/permissions, remova o PsiConnect e tente novamente.');
    }

    await calendarTokenModel.salvar(userId, tokens.access_token, refreshToken, new Date(tokens.expiry_date || Date.now() + 3600000));
    return { message: 'Google Calendar conectado!' };
  } catch (err) {
    console.error('[Calendar] callback error:', err.message);
    throw err;
  }
}

async function getClienteAutenticado(userId) {
  const tokenData = await calendarTokenModel.findByUserId(userId);
  if (!tokenData) return null;

  const client = criarClienteOAuth();
  client.setCredentials({ access_token: tokenData.access_token, refresh_token: tokenData.refresh_token });

  const expiracao = new Date(tokenData.expires_at);
  if (new Date() >= new Date(expiracao.getTime() - 5 * 60000)) {
    try {
      const { credentials } = await client.refreshAccessToken();
      const novoRefresh = credentials.refresh_token || tokenData.refresh_token;
      await calendarTokenModel.salvar(userId, credentials.access_token, novoRefresh, new Date(credentials.expiry_date || Date.now() + 3600000));
      client.setCredentials({ access_token: credentials.access_token, refresh_token: novoRefresh });
    } catch (err) {
      console.error('[Calendar] token refresh error:', err.message);
      await calendarTokenModel.remove(userId);
      return null;
    }
  }
  return client;
}

async function criarEvento(userId, consulta) {
  try {
    const auth = await getClienteAutenticado(userId);
    if (!auth) return null;

    const calendar = google.calendar({ version: 'v3', auth });
    const inicio   = new Date(consulta.scheduled_at);
    const fim      = new Date(inicio.getTime() + 60 * 60 * 1000);

    const attendees = [];
    if (consulta.patient_email && consulta.patient_email.includes('@')) {
      attendees.push({ email: consulta.patient_email, displayName: consulta.patient_name });
    }

    const resource = {
      summary:     `Sessão de Psicologia - ${consulta.patient_name}`,
      description: `Sessão de psicoterapia com ${consulta.patient_name}.\n\nAgendado via PsiConnect.`,
      start: { dateTime: inicio.toISOString(), timeZone: 'America/Sao_Paulo' },
      end:   { dateTime: fim.toISOString(),    timeZone: 'America/Sao_Paulo' },
      conferenceData: {
        createRequest: {
          requestId:              `psiconnect-${consulta.id}-${Date.now()}`,
          conferenceSolutionKey:  { type: 'hangoutsMeet' },
        },
      },
      reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 30 }] },
    };

    if (attendees.length > 0) {
      resource.attendees = attendees;
      resource.guestsCanSeeOtherGuests = false;
    }

    const resposta = await calendar.events.insert({
      calendarId:            'primary',
      resource,
      conferenceDataVersion: 1,
      sendUpdates:           attendees.length > 0 ? 'all' : 'none',
    });

    return resposta.data.id;
  } catch (err) {
    console.error('[Calendar] create event error:', err.message);
    return null;
  }
}

async function atualizarEvento(userId, consulta) {
  if (!consulta.google_event_id) return;
  try {
    const auth = await getClienteAutenticado(userId);
    if (!auth) return;
    const calendar = google.calendar({ version: 'v3', auth });
    const inicio   = new Date(consulta.scheduled_at);
    const fim      = new Date(inicio.getTime() + 60 * 60 * 1000);

    const attendees = [];
    if (consulta.patient_email?.includes('@')) {
      attendees.push({ email: consulta.patient_email, displayName: consulta.patient_name });
    }

    const resource = {
      summary:     `Sessão de Psicologia - ${consulta.patient_name}`,
      description: `Sessão de psicoterapia com ${consulta.patient_name}.\n\nAgendado via PsiConnect.`,
      start: { dateTime: inicio.toISOString(), timeZone: 'America/Sao_Paulo' },
      end:   { dateTime: fim.toISOString(),    timeZone: 'America/Sao_Paulo' },
    };

    if (attendees.length > 0) {
      resource.attendees = attendees;
      resource.guestsCanSeeOtherGuests = false;
    }

    await calendar.events.update({
      calendarId:  'primary',
      eventId:     consulta.google_event_id,
      resource,
      sendUpdates: attendees.length > 0 ? 'all' : 'none',
    });
  } catch (err) {
    if (err.code !== 404 && err.code !== 410) console.error('[Calendar] update event error:', err.message);
  }
}

async function deletarEvento(userId, googleEventId) {
  if (!googleEventId) return;
  try {
    const auth = await getClienteAutenticado(userId);
    if (!auth) return;
    const calendar = google.calendar({ version: 'v3', auth });
    await calendar.events.delete({ calendarId: 'primary', eventId: googleEventId, sendUpdates: 'all' });
  } catch (err) {
    if (err.code !== 404 && err.code !== 410) console.error('[Calendar] delete event error:', err.message);
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

module.exports = { getUrlAutorizacao, processarCallback, criarEvento, atualizarEvento, deletarEvento, getStatus, desconectar };
