// Funções auxiliares para trabalhar com tokens JWT
const jwt = require('jsonwebtoken');

// Cria um novo token com os dados do usuário dentro
// O token fica guardado no navegador e é enviado em toda requisição protegida
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// Verifica se um token é válido e retorna os dados que estão dentro dele
// Se o token for inválido ou expirado, lança um erro
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { generateToken, verifyToken };
