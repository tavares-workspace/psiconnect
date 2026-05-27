
const { verifyToken } = require('../utils/jwtUtils');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acesso negado. Faça login primeiro.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const dadosDoUsuario = verifyToken(token);

    req.user = dadosDoUsuario;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado. Faça login novamente.' });
  }
}

module.exports = authMiddleware;
