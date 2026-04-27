// Middleware de autenticação
// Um middleware é uma função que roda ANTES do controller
// Este aqui verifica se o usuário está logado antes de deixar acessar a rota

const { verifyToken } = require('../utils/jwtUtils');

function authMiddleware(req, res, next) {
  // O token JWT vem no cabeçalho da requisição, no formato: "Bearer <token>"
  const authHeader = req.headers.authorization;

  // Se não tiver token no cabeçalho, nega o acesso
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acesso negado. Faça login primeiro.' });
  }

  // Pega só o token (remove o "Bearer " do começo)
  const token = authHeader.split(' ')[1];

  try {
    // Verifica se o token é válido e pega os dados do usuário que estão dentro dele
    const dadosDoUsuario = verifyToken(token);

    // Coloca os dados do usuário no objeto req para o controller usar
    req.user = dadosDoUsuario;

    // Chama o próximo passo (o controller)
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado. Faça login novamente.' });
  }
}

module.exports = authMiddleware;
