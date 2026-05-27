const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const { name, email, password, crp, phone, aceite_termos } = req.body;

    if (!aceite_termos) {
      return res.status(400).json({ message: 'É necessário aceitar os Termos de Uso e a Política de Privacidade.' });
    }

    const resultado = await authService.cadastrar(name, email, password, crp, phone);
    return res.status(201).json({ message: 'Cadastro realizado!', ...resultado });
  } catch (e) { next(e); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const resultado = await authService.login(email, password);
    return res.status(200).json({ message: 'Login realizado!', ...resultado });
  } catch (e) { next(e); }
}

async function getProfile(req, res, next) {
  try {
    const usuario = await authService.getPerfil(req.user.id);
    return res.status(200).json(usuario);
  } catch (e) { next(e); }
}

async function updateProfile(req, res, next) {
  try {
    const { name, crp, phone } = req.body;
    if (!name) return res.status(400).json({ message: 'O nome é obrigatório.' });
    const usuario = await authService.atualizarPerfil(req.user.id, name, crp, phone);
    return res.status(200).json({ message: 'Perfil atualizado!', usuario });
  } catch (e) { next(e); }
}

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
  } catch (e) { next(e); }
}

async function deleteAccount(req, res, next) {
  try {
    const { confirmacao } = req.body;
    if (confirmacao !== 'CONFIRMAR') {
      return res.status(400).json({ message: 'Para excluir a conta, envie confirmacao: "CONFIRMAR".' });
    }
    const resultado = await authService.excluirConta(req.user.id);
    return res.status(200).json(resultado);
  } catch (e) { next(e); }
}

module.exports = { register, login, getProfile, updateProfile, changePassword, deleteAccount };
