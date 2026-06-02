jest.mock('../models/userModel');
jest.mock('../utils/jwtUtils');

const userModel = require('../models/userModel');
const jwtUtils  = require('../utils/jwtUtils');
const authService = require('../services/authService');

describe('authService.cadastrar', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejeita e-mail já cadastrado', async () => {
    userModel.findByEmail.mockResolvedValue({ id: '1', email: 'a@a.com' });
    await expect(authService.cadastrar('Nome', 'a@a.com', '123456', '', ''))
      .rejects.toMatchObject({ status: 409 });
  });

  it('cria usuario com sucesso', async () => {
    userModel.findByEmail.mockResolvedValue(null);
    userModel.create.mockResolvedValue({ id: '1', name: 'Nome', email: 'a@a.com' });
    jwtUtils.generateToken.mockReturnValue('token123');
    const res = await authService.cadastrar('Nome', 'a@a.com', '123456', '', '');
    expect(res.token).toBe('token123');
    expect(res.usuario.email).toBe('a@a.com');
  });
});

describe('authService.login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejeita e-mail nao encontrado', async () => {
    userModel.findByEmail.mockResolvedValue(null);
    await expect(authService.login('x@x.com', '123'))
      .rejects.toMatchObject({ status: 401 });
  });

  it('rejeita senha incorreta', async () => {
    userModel.findByEmail.mockResolvedValue({ id: '1', email: 'a@a.com', password_hash: '$2a$10$invalido' });
    await expect(authService.login('a@a.com', 'senhaerrada'))
      .rejects.toMatchObject({ status: 401 });
  });
});

describe('authService.alterarSenha', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejeita senha atual incorreta', async () => {
    userModel.findById.mockResolvedValue({ email: 'a@a.com' });
    userModel.findByEmail.mockResolvedValue({ password_hash: '$2a$10$invalido' });
    await expect(authService.alterarSenha('1', 'senhaerrada', 'nova123'))
      .rejects.toMatchObject({ status: 401 });
  });
});

describe('authService.getPerfil', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna perfil do usuario', async () => {
    userModel.findById.mockResolvedValue({ id: '1', name: 'Nathan', email: 'n@n.com' });
    const perfil = await authService.getPerfil('1');
    expect(perfil.name).toBe('Nathan');
  });

  it('lanca 404 quando usuario nao existe', async () => {
    userModel.findById.mockResolvedValue(null);
    await expect(authService.getPerfil('999')).rejects.toMatchObject({ status: 404 });
  });
});

describe('authService.atualizarPerfil', () => {
  beforeEach(() => jest.clearAllMocks());

  it('atualiza perfil com sucesso', async () => {
    userModel.update.mockResolvedValue({ id: '1', name: 'Novo Nome' });
    const u = await authService.atualizarPerfil('1', 'Novo Nome', '', '');
    expect(u.name).toBe('Novo Nome');
  });

  it('lanca 404 quando usuario nao existe', async () => {
    userModel.update.mockResolvedValue(null);
    await expect(authService.atualizarPerfil('999', 'Nome', '', '')).rejects.toMatchObject({ status: 404 });
  });
});
