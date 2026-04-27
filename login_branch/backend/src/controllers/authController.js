// Controller de autenticação
// Recebe a requisição HTTP, chama o service e devolve a resposta

const authService = require('../services/authService');

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password, crp, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    const resultado = await authService.cadastrar(name, email, password, crp, phone);
    return res.status(201).json({ message: 'Cadastro realizado!', ...resultado });
  } catch (erro) {
    next(erro);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    const resultado = await authService.login(email, password);
    return res.status(200).json({ message: 'Login realizado!', ...resultado });
  } catch (erro) {
    next(erro);
  }
}

// GET /api/auth/profile
async function getProfile(req, res, next) {
  try {
    const usuario = await authService.getPerfil(req.user.id);
    return res.status(200).json(usuario);
  } catch (erro) {
    next(erro);
  }
}

// PUT /api/auth/profile
async function updateProfile(req, res, next) {
  try {
    const { name, crp, phone } = req.body;
    if (!name) return res.status(400).json({ message: 'O nome é obrigatório.' });

    const usuario = await authService.atualizarPerfil(req.user.id, name, crp, phone);
    return res.status(200).json({ message: 'Perfil atualizado!', usuario });
  } catch (erro) {
    next(erro);
  }
}

// PUT /api/auth/change-password
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }

    const resultado = await authService.alterarSenha(req.user.id, currentPassword, newPassword);
    return res.status(200).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

module.exports = { register, login, getProfile, updateProfile, changePassword };
