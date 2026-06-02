const bcrypt          = require('bcryptjs');
const userModel       = require('../models/userModel');
const resetTokenModel = require('../models/resetTokenModel');
const emailService    = require('../services/emailService');

async function solicitarReset(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'E-mail é obrigatório.' });

    const usuario = await userModel.findByEmail(email);

    // Sempre retorna sucesso — não revela se o e-mail existe ou não
    if (!usuario) {
      return res.status(200).json({ message: 'Se esse e-mail estiver cadastrado, você receberá as instruções em breve.' });
    }

    const token = await resetTokenModel.criar(usuario.id);
    await emailService.enviarResetSenha(usuario.email, usuario.name, token);

    return res.status(200).json({ message: 'Se esse e-mail estiver cadastrado, você receberá as instruções em breve.' });
  } catch (e) {
    const detalhe = e.response?.body || e.message;
    console.error('[Reset] erro ao enviar e-mail:', JSON.stringify(detalhe));
    return res.status(500).json({ message: 'Erro ao enviar o e-mail. Tente novamente.' });
  }
}

async function validarToken(req, res, next) {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Token inválido.' });

    const registro = await resetTokenModel.buscar(token);
    if (!registro) return res.status(400).json({ message: 'Link inválido ou expirado.' });

    return res.status(200).json({ message: 'Token válido.' });
  } catch (e) { next(e); }
}

async function redefinirSenha(req, res, next) {
  try {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha) {
      return res.status(400).json({ message: 'Token e nova senha são obrigatórios.' });
    }
    if (novaSenha.length < 6) {
      return res.status(400).json({ message: 'Senha deve ter ao menos 6 caracteres.' });
    }
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(novaSenha)) {
      return res.status(400).json({ message: 'Senha deve conter ao menos uma letra e um número.' });
    }

    const registro = await resetTokenModel.buscar(token);
    if (!registro) return res.status(400).json({ message: 'Link inválido ou expirado.' });

    const hash = await bcrypt.hash(novaSenha, 10);
    await userModel.updatePassword(registro.user_id, hash);
    await resetTokenModel.marcarUsado(token);

    return res.status(200).json({ message: 'Senha redefinida com sucesso!' });
  } catch (e) { next(e); }
}

module.exports = { solicitarReset, validarToken, redefinirSenha };
