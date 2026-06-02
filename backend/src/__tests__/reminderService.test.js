jest.mock('../models/reminderModel');

const reminderModel   = require('../models/reminderModel');
const reminderService = require('../services/reminderService');

describe('reminderService.listar', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna lembretes do usuario', async () => {
    reminderModel.findAll.mockResolvedValue([{ id: '1', title: 'Teste' }]);
    const lista = await reminderService.listar('user1');
    expect(lista).toHaveLength(1);
  });
});

describe('reminderService.criar', () => {
  beforeEach(() => jest.clearAllMocks());

  it('cria lembrete com sucesso', async () => {
    reminderModel.create.mockResolvedValue({ id: '1', title: 'Lembrete', done: false });
    const l = await reminderService.criar('user1', { title: 'Lembrete', remind_at: '2027-01-01T10:00' });
    expect(l.title).toBe('Lembrete');
  });

  it('rejeita sem titulo', async () => {
    await expect(reminderService.criar('user1', { remind_at: '2027-01-01T10:00' }))
      .rejects.toMatchObject({ status: 400 });
  });

  it('rejeita sem data', async () => {
    await expect(reminderService.criar('user1', { title: 'Teste' }))
      .rejects.toMatchObject({ status: 400 });
  });
});

describe('reminderService.atualizar', () => {
  beforeEach(() => jest.clearAllMocks());

  it('atualiza done sem exigir outros campos', async () => {
    reminderModel.findById.mockResolvedValue({ id: '1', title: 'A', remind_at: '2027-01-01', done: false, description: '' });
    reminderModel.update.mockResolvedValue({ id: '1', done: true });
    const res = await reminderService.atualizar('1', 'user1', { done: true });
    expect(res.done).toBe(true);
  });

  it('lanca 404 quando nao encontrado', async () => {
    reminderModel.findById.mockResolvedValue(null);
    await expect(reminderService.atualizar('999', 'user1', { done: true }))
      .rejects.toMatchObject({ status: 404 });
  });
});

describe('reminderService.remover', () => {
  beforeEach(() => jest.clearAllMocks());

  it('remove lembrete com sucesso', async () => {
    reminderModel.remove.mockResolvedValue({ id: '1' });
    await reminderService.remover('1', 'user1');
    expect(reminderModel.remove).toHaveBeenCalledWith('1', 'user1');
  });
});
