jest.mock('../models/appointmentModel');
jest.mock('../models/patientModel');
jest.mock('../models/tarefaModel');
jest.mock('../services/calendarService');

const appointmentModel  = require('../models/appointmentModel');
const patientModel      = require('../models/patientModel');
const tarefaModel       = require('../models/tarefaModel');
const calendarService   = require('../services/calendarService');
const appointmentService = require('../services/appointmentService');

describe('appointmentService.buscarPorId', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna consulta quando encontrada', async () => {
    appointmentModel.findById.mockResolvedValue({ id: '1', patient_id: 'p1' });
    const c = await appointmentService.buscarPorId('1', 'user1');
    expect(c.id).toBe('1');
  });

  it('lanca 404 quando nao encontrada', async () => {
    appointmentModel.findById.mockResolvedValue(null);
    await expect(appointmentService.buscarPorId('999', 'user1'))
      .rejects.toMatchObject({ status: 404 });
  });
});

describe('appointmentService.criar', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejeita sem patient_id', async () => {
    await expect(appointmentService.criar('user1', { scheduled_at: '2027-01-01T10:00' }))
      .rejects.toMatchObject({ status: 400 });
  });

  it('rejeita sem scheduled_at', async () => {
    await expect(appointmentService.criar('user1', { patient_id: 'p1' }))
      .rejects.toMatchObject({ status: 400 });
  });

  it('rejeita paciente nao encontrado', async () => {
    patientModel.findById.mockResolvedValue(null);
    await expect(appointmentService.criar('user1', { patient_id: 'p1', scheduled_at: '2027-01-01T10:00' }))
      .rejects.toMatchObject({ status: 404 });
  });

  it('cria consulta com sucesso', async () => {
    patientModel.findById.mockResolvedValue({ id: 'p1', name: 'Ana', email: 'ana@a.com', funil_etapa: 'Interessado' });
    patientModel.ETAPAS_FUNIL = ['Interessado', 'Triagem', 'Agendamento', 'Primeira Sessão', 'Paciente Ativo', 'Aguardando Retorno', 'Alta/Encerrado', 'Abandono'];
    appointmentModel.create.mockResolvedValue({ id: '1', patient_id: 'p1' });
    patientModel.updateFunilEtapa.mockResolvedValue({});
    calendarService.criarEvento.mockResolvedValue('event123');
    appointmentModel.saveGoogleEventId.mockResolvedValue({});

    const res = await appointmentService.criar('user1', { patient_id: 'p1', scheduled_at: '2027-01-01T10:00' });
    expect(res.consulta.id).toBe('1');
  });
});

describe('appointmentService.cancelar', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lanca 404 quando consulta nao encontrada', async () => {
    appointmentModel.findById.mockResolvedValue(null);
    await expect(appointmentService.cancelar('999', 'user1', 'one'))
      .rejects.toMatchObject({ status: 404 });
  });

  it('cancela consulta unica', async () => {
    appointmentModel.findById.mockResolvedValue({ id: '1', recorrencia_id: null, google_event_id: null });
    appointmentModel.cancelOne.mockResolvedValue({ id: '1', status: 'cancelled' });
    const res = await appointmentService.cancelar('1', 'user1', 'one');
    expect(res.status).toBe('cancelled');
  });
});

describe('appointmentService.listar', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna todas as consultas sem filtro', async () => {
    appointmentModel.findAll.mockResolvedValue([{ id: 'a1' }, { id: 'a2' }]);
    const lista = await appointmentService.listar('user1', null, null, null, null);
    expect(lista).toHaveLength(2);
  });

  it('passa filtros para o model', async () => {
    appointmentModel.findAll.mockResolvedValue([]);
    await appointmentService.listar('user1', '2026-01-01', '2026-12-31', 'scheduled', null);
    expect(appointmentModel.findAll).toHaveBeenCalledWith('user1', '2026-01-01', '2026-12-31', 'scheduled', null);
  });
});

describe('appointmentService.concluir', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lanca 404 quando consulta nao existe', async () => {
    appointmentModel.updateStatus.mockResolvedValue(null);
    await expect(appointmentService.concluir('999', 'user1'))
      .rejects.toMatchObject({ status: 404 });
  });

  it('conclui consulta e avanca funil', async () => {
    appointmentModel.updateStatus.mockResolvedValue({ id: 'a1', patient_id: 'p1', status: 'completed' });
    patientModel.findById.mockResolvedValue({ id: 'p1', name: 'Ana', funil_etapa: 'Agendamento' });
    patientModel.updateFunilEtapa.mockResolvedValue({});
    tarefaModel.existePendente.mockResolvedValue(false);
    tarefaModel.create.mockResolvedValue({});
    const res = await appointmentService.concluir('a1', 'user1');
    expect(res.status).toBe('completed');
    expect(patientModel.updateFunilEtapa).toHaveBeenCalledWith('p1', 'user1', 'Primeira Sessão');
  });

  it('nao cria tarefa duplicada de prontuario', async () => {
    appointmentModel.updateStatus.mockResolvedValue({ id: 'a1', patient_id: 'p1', status: 'completed' });
    patientModel.findById.mockResolvedValue({ id: 'p1', name: 'Ana', funil_etapa: 'Paciente Ativo' });
    patientModel.updateFunilEtapa.mockResolvedValue({});
    tarefaModel.existePendente.mockResolvedValue(true);
    await appointmentService.concluir('a1', 'user1');
    expect(tarefaModel.create).not.toHaveBeenCalled();
  });
});

describe('appointmentService.atualizar', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejeita sem dados obrigatorios', async () => {
    await expect(appointmentService.atualizar('a1', 'user1', {}, 'one'))
      .rejects.toMatchObject({ status: 400 });
  });

  it('lanca 404 quando consulta nao existe', async () => {
    appointmentModel.findById.mockResolvedValue(null);
    await expect(appointmentService.atualizar('999', 'user1', { patient_id: 'p1', scheduled_at: '2027-01-01' }, 'one'))
      .rejects.toMatchObject({ status: 404 });
  });
});
