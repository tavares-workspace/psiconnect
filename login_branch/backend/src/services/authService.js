// Service de autenticação
// Aqui fica a lógica de negócio do login e cadastro
// O controller chama estas funções e recebe o resultado

const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const { generateToken } = require('../utils/jwtUtils');

// Número de "rounds" do bcrypt - quanto maior, mais seguro e mais lento
// 10 é o valor recomendado para a maioria dos sistemas
const SALT_ROUNDS = 10;

// Cadastra um novo usuário
async function cadastrar(name, email, password, crp, phone) {
  // Verifica se já existe uma conta com esse e-mail
  const usuarioExistente = await userModel.findByEmail(email);
  if (usuarioExistente) {
    const erro = new Error('Este e-mail já está cadastrado.');
    erro.status = 409;
    throw erro;
  }

  // Criptografa a senha antes de salvar no banco
  // Nunca salvamos a senha em texto puro por segurança
  const senhaCriptografada = await bcrypt.hash(password, SALT_ROUNDS);

  // Salva o usuário no banco
  const usuario = await userModel.create(name, email, senhaCriptografada, crp, phone);

  // Gera o token JWT para o usuário já ficar logado após o cadastro
  const token = generateToken({ id: usuario.id, name: usuario.name, email: usuario.email });

  return { usuario, token };
}

// Faz o login do usuário
async function login(email, password) {
  // Busca o usuário pelo e-mail
  const usuario = await userModel.findByEmail(email);

  // Se não encontrou, retorna erro genérico (não diz se é e-mail ou senha errada, por segurança)
  if (!usuario) {
    const erro = new Error('E-mail ou senha incorretos.');
    erro.status = 401;
    throw erro;
  }

  // Compara a senha digitada com o hash salvo no banco
  const senhaCorreta = await bcrypt.compare(password, usuario.password_hash);
  if (!senhaCorreta) {
    const erro = new Error('E-mail ou senha incorretos.');
    erro.status = 401;
    throw erro;
  }

  // Gera o token JWT
  const token = generateToken({ id: usuario.id, name: usuario.name, email: usuario.email });

  // Remove a senha do objeto antes de retornar (nunca enviamos a senha para o front)
  const { password_hash, ...usuarioSemSenha } = usuario;

  return { usuario: usuarioSemSenha, token };
}

// Retorna o perfil do usuário logado
async function getPerfil(userId) {
  const usuario = await userModel.findById(userId);
  if (!usuario) {
    const erro = new Error('Usuário não encontrado.');
    erro.status = 404;
    throw erro;
  }
  return usuario;
}

// Atualiza os dados do perfil
async function atualizarPerfil(userId, name, crp, phone) {
  const usuario = await userModel.update(userId, name, crp, phone);
  if (!usuario) {
    const erro = new Error('Usuário não encontrado.');
    erro.status = 404;
    throw erro;
  }
  return usuario;
}

// Altera a senha do usuário
async function alterarSenha(userId, senhaAtual, novaSenha) {
  // Busca o usuário completo (com a senha) para comparar
  const perfil = await userModel.findById(userId);
  const usuarioCompleto = await userModel.findByEmail(perfil.email);

  const senhaCorreta = await bcrypt.compare(senhaAtual, usuarioCompleto.password_hash);
  if (!senhaCorreta) {
    const erro = new Error('Senha atual incorreta.');
    erro.status = 401;
    throw erro;
  }

  const novoHash = await bcrypt.hash(novaSenha, SALT_ROUNDS);
  await userModel.updatePassword(userId, novoHash);

  return { message: 'Senha alterada com sucesso.' };
}

module.exports = { cadastrar, login, getPerfil, atualizarPerfil, alterarSenha };
