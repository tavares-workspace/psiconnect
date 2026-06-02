jest.mock('../models/tarefaModel');
jest.mock('../models/patientModel');
jest.mock('../models/appointmentModel');

const tarefaModel      = require('../models/tarefaModel');
const patientModel     = require('../models/patientModel');
const appointmentModel = require('../models/appointmentModel');
const tarefaService    = require('../services/tarefaService');

describe('tarefaService.listarPendentes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna tarefas pendentes', async () => {
    tarefaModel.findPendentes.mockResolvedValue([{ id: '1', titulo: 'Preencher prontuario' }]);
    const lista = await tarefaService.listarPendentes('user1');
    expect(lista).toHaveLength(1);
  });
});

describe('tarefaService.marcarFeita', () => {
  beforeEach(() => jest.clearAllMocks());

  it('marca tarefa como concluida', async () => {
    tarefaModel.marcarFeita.mockResolvedValue({ id: '1', done: true });
    await tarefaService.marcarFeita('1', 'user1');
    expect(tarefaModel.marcarFeita).toHaveBeenCalledWith('1', 'user1');
  });
});

describe('tarefaService.remover', () => {
  beforeEach(() => jest.clearAllMocks());

  it('remove tarefa', async () => {
    tarefaModel.remove.mockResolvedValue({ id: '1' });
    await tarefaService.remover('1', 'user1');
    expect(tarefaModel.remove).toHaveBeenCalledWith('1', 'user1');
  });
});

describe('tarefaService.verificarEGerarTarefas', () => {
  beforeEach(() => jest.clearAllMocks());

  it('nao gera tarefas quando nao ha pendencias', async () => {
    patientModel.findAguardandoRetornoVencidos.mockResolvedValue([]);
    patientModel.findAniversariantesDoDia.mockResolvedValue([]);
    appointmentModel.findSemProntuarioApos1h.mockResolvedValue([]);
    await tarefaService.verificarEGerarTarefas('user1');
    expect(tarefaModel.create).not.toHaveBeenCalled();
  });
});
