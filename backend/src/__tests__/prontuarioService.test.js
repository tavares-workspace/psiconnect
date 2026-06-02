jest.mock('../models/prontuarioModel');
jest.mock('../models/patientModel');

const prontuarioModel = require('../models/prontuarioModel');
const patientModel    = require('../models/patientModel');
const prontuarioService = require('../services/prontuarioService');

describe('prontuarioService.buscar', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna prontuario quando paciente existe', async () => {
    patientModel.findById.mockResolvedValue({ id: 'p1', name: 'Ana' });
    prontuarioModel.findDecrypted.mockResolvedValue({ id: '1', evolucao: 'texto' });
    const p = await prontuarioService.buscar('p1', 'user1');
    expect(p).not.toBeNull();
  });

  it('lanca 404 quando paciente nao existe', async () => {
    patientModel.findById.mockResolvedValue(null);
    await expect(prontuarioService.buscar('p1', 'user1'))
      .rejects.toMatchObject({ status: 404 });
  });

  it('retorna null quando prontuario nao existe', async () => {
    patientModel.findById.mockResolvedValue({ id: 'p1' });
    prontuarioModel.findDecrypted.mockResolvedValue(null);
    const p = await prontuarioService.buscar('p1', 'user1');
    expect(p).toBeNull();
  });
});

describe('prontuarioService.salvar', () => {
  beforeEach(() => jest.clearAllMocks());

  it('salva prontuario com sucesso', async () => {
    patientModel.findById.mockResolvedValue({ id: 'p1' });
    prontuarioModel.upsert.mockResolvedValue({ id: '1', patient_id: 'p1' });
    await prontuarioService.salvar('p1', 'user1', 'Evolucao', null, null);
    expect(prontuarioModel.upsert).toHaveBeenCalledWith('p1', 'Evolucao', null, null);
  });

  it('lanca 404 quando paciente nao existe', async () => {
    patientModel.findById.mockResolvedValue(null);
    await expect(prontuarioService.salvar('p1', 'user1', 'Evolucao', null, null))
      .rejects.toMatchObject({ status: 404 });
  });
});
