jest.mock('../models/patientModel');

const patientModel  = require('../models/patientModel');
const patientService = require('../services/patientService');

describe('patientService.buscarPorId', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna paciente quando encontrado', async () => {
    patientModel.findById.mockResolvedValue({ id: '1', name: 'Ana' });
    const p = await patientService.buscarPorId('1', 'user1');
    expect(p.name).toBe('Ana');
  });

  it('lanca erro 404 quando nao encontrado', async () => {
    patientModel.findById.mockResolvedValue(null);
    await expect(patientService.buscarPorId('999', 'user1'))
      .rejects.toMatchObject({ status: 404 });
  });
});

describe('patientService.criar', () => {
  beforeEach(() => jest.clearAllMocks());

  it('cria paciente com sucesso', async () => {
    patientModel.create.mockResolvedValue({ id: '1', name: 'Ana', funil_etapa: 'Interessado' });
    const p = await patientService.criar('user1', { name: 'Ana', email: 'ana@a.com' });
    expect(p.name).toBe('Ana');
    expect(patientModel.create).toHaveBeenCalledTimes(1);
  });

  it('rejeita sem nome', async () => {
    await expect(patientService.criar('user1', { name: '' }))
      .rejects.toMatchObject({ status: 400 });
  });
});

describe('patientService.listar', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna lista de pacientes', async () => {
    patientModel.findAll.mockResolvedValue([{ id: '1', name: 'Ana' }]);
    const lista = await patientService.listar('user1', '');
    expect(lista).toHaveLength(1);
  });
});

describe('patientService.atualizar', () => {
  beforeEach(() => jest.clearAllMocks());

  it('atualiza paciente com sucesso', async () => {
    patientModel.update.mockResolvedValue({ id: '1', name: 'Ana Atualizada' });
    const p = await patientService.atualizar('1', 'user1', { name: 'Ana Atualizada', email: '' });
    expect(p.name).toBe('Ana Atualizada');
  });

  it('rejeita sem nome', async () => {
    await expect(patientService.atualizar('1', 'user1', { name: '' }))
      .rejects.toMatchObject({ status: 400 });
  });
});

describe('patientService.remover', () => {
  beforeEach(() => jest.clearAllMocks());

  it('remove paciente com sucesso', async () => {
    patientModel.remove.mockResolvedValue({ id: '1' });
    const res = await patientService.remover('1', 'user1');
    expect(patientModel.remove).toHaveBeenCalledWith('1', 'user1');
  });
});
