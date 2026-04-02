// Controller do Google Calendar
const calendarService = require('../services/calendarService');

// GET /api/calendar/auth-url
// Retorna a URL para o psicólogo autorizar o acesso ao Google Calendar
async function getAuthUrl(req, res, next) {
  try {
    const url = calendarService.getUrlAutorizacao(req.user.id);
    return res.status(200).json({ url });
  } catch (err) {
    // Se as credenciais não estiverem configuradas, retorna mensagem clara
    return res.status(500).json({
      message: err.message || 'Google Calendar não configurado no servidor.',
    });
  }
}

// GET /api/calendar/callback
// O Google redireciona aqui após o usuário autorizar
// NÃO tem authMiddleware — o userId vem pelo parâmetro "state"
async function handleCallback(req, res, next) {
  try {
    const { code, state, error } = req.query;

    // Se o usuário clicou em "Negar" na tela do Google
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

    // state contém o userId que passamos na getUrlAutorizacao
    await calendarService.processarCallback(state, code);

    // Redireciona de volta para as configurações com sucesso
    return res.redirect(`${process.env.FRONTEND_URL}/settings?calendar=connected`);
  } catch (err) {
    console.error('Erro no callback do Google Calendar:', err.message);
    const msg = encodeURIComponent(err.message || 'erro_desconhecido');
    return res.redirect(`${process.env.FRONTEND_URL}/settings?calendar=error&msg=${msg}`);
  }
}

// GET /api/calendar/status
async function getStatus(req, res, next) {
  try {
    const status = await calendarService.getStatus(req.user.id);
    return res.status(200).json(status);
  } catch (err) { next(err); }
}

// DELETE /api/calendar/disconnect
async function disconnect(req, res, next) {
  try {
    const resultado = await calendarService.desconectar(req.user.id);
    return res.status(200).json(resultado);
  } catch (err) { next(err); }
}

module.exports = { getAuthUrl, handleCallback, getStatus, disconnect };
