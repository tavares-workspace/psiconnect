const calendarService = require('../services/calendarService');

async function getAuthUrl(req, res, next) {
  try {
    const url = calendarService.getUrlAutorizacao(req.user.id);
    return res.status(200).json({ url });
  } catch (err) {
    return res.status(500).json({
      message: err.message || 'Google Calendar não configurado no servidor.',
    });
  }
}

async function handleCallback(req, res, next) {
  try {
    const { code, state, error } = req.query;

    if (error) {
      console.error('Usuário negou acesso ao Google Calendar:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/settings?calendar=denied`);
    }

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/settings?calendar=error&msg=codigo_ausente`);
    }

    if (!state) {
      return res.redirect(`${process.env.FRONTEND_URL}/settings?calendar=error&msg=state_ausente`);
    }

    await calendarService.processarCallback(state, code);

    return res.redirect(`${process.env.FRONTEND_URL}/settings?calendar=connected`);
  } catch (err) {
    console.error('Erro no callback do Google Calendar:', err.message);
    const msg = encodeURIComponent(err.message || 'erro_desconhecido');
    return res.redirect(`${process.env.FRONTEND_URL}/settings?calendar=error&msg=${msg}`);
  }
}

async function getStatus(req, res, next) {
  try {
    const status = await calendarService.getStatus(req.user.id);
    return res.status(200).json(status);
  } catch (err) { next(err); }
}

async function disconnect(req, res, next) {
  try {
    const resultado = await calendarService.desconectar(req.user.id);
    return res.status(200).json(resultado);
  } catch (err) { next(err); }
}

module.exports = { getAuthUrl, handleCallback, getStatus, disconnect };
