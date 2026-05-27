const bcrypt    = require('bcryptjs');
const userModel = require('../models/userModel');
const { generateToken } = require('../utils/jwtUtils');

const SALT_ROUNDS = 10;

async function cadastrar(name, email, password, crp, phone) {
  const existente = await userModel.findByEmail(email);
  if (existente) {
    const e = new Error('Este e-mail já está cadastrado.'); e.status = 409; throw e;
  }

  const hash    = await bcrypt.hash(password, SALT_ROUNDS);
  const usuario = await userModel.create(name, email, hash, crp, phone);
  const token   = generateToken({ id: usuario.id, name: usuario.name, email: usuario.email });

  return { usuario, token };
}

async function login(email, password) {
  const usuario = await userModel.findByEmail(email);
  if (!usuario) {
    const e = new Error('E-mail ou senha incorretos.'); e.status = 401; throw e;
  }

  const senhaCorreta = await bcrypt.compare(password, usuario.password_hash);
  if (!senhaCorreta) {
    const e = new Error('E-mail ou senha incorretos.'); e.status = 401; throw e;
  }

  const token = generateToken({ id: usuario.id, name: usuario.name, email: usuario.email });
  const { password_hash, ...usuarioSemSenha } = usuario;

  return { usuario: usuarioSemSenha, token };
}

async function getPerfil(userId) {
  const usuario = await userModel.findById(userId);
  if (!usuario) {
    const e = new Error('Usuário não encontrado.'); e.status = 404; throw e;
  }
  return usuario;
}

async function atualizarPerfil(userId, name, crp, phone) {
  const usuario = await userModel.update(userId, name, crp, phone);
  if (!usuario) {
    const e = new Error('Usuário não encontrado.'); e.status = 404; throw e;
  }
  return usuario;
}

async function alterarSenha(userId, senhaAtual, novaSenha) {
  const perfil   = await userModel.findById(userId);
  const completo = await userModel.findByEmail(perfil.email);

  const senhaCorreta = await bcrypt.compare(senhaAtual, completo.password_hash);
  if (!senhaCorreta) {
    const e = new Error('Senha atual incorreta.'); e.status = 401; throw e;
  }

  const novoHash = await bcrypt.hash(novaSenha, SALT_ROUNDS);
  await userModel.updatePassword(userId, novoHash);

  return { message: 'Senha alterada com sucesso.' };
}

// Exclusão de conta conforme LGPD:
// - Remove dados pessoais do usuário e pacientes
// - Mantém registros de appointments para preservar métricas do dashboard
async function excluirConta(userId) {
  await userModel.removerDadosPacientes(userId);
  await userModel.anonimizar(userId);
  return { message: 'Conta encerrada. Seus dados pessoais foram removidos.' };
}

module.exports = { cadastrar, login, getPerfil, atualizarPerfil, alterarSenha, excluirConta };
