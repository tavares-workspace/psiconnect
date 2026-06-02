const rateLimit = require('express-rate-limit');

const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { message: 'Limite de requisições atingido. Aguarde um momento.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimit, apiLimit };
