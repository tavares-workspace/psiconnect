jest.mock('../models/noteModel');
jest.mock('../models/appointmentModel');

const noteModel        = require('../models/noteModel');
const appointmentModel = require('../models/appointmentModel');
const noteService      = require('../services/noteService');

describe('noteService.listarPorConsulta', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna anotacoes quando consulta existe', async () => {
    appointmentModel.findById.mockResolvedValue({ id: 'a1' });
    noteModel.findByAppointment.mockResolvedValue([{ id: '1', content: 'Nota' }]);
    const lista = await noteService.listarPorConsulta('a1', 'user1');
    expect(lista).toHaveLength(1);
  });

  it('lanca 404 quando consulta nao existe', async () => {
    appointmentModel.findById.mockResolvedValue(null);
    await expect(noteService.listarPorConsulta('a1', 'user1'))
      .rejects.toMatchObject({ status: 404 });
  });

  it('retorna lista vazia quando nao ha notas', async () => {
    appointmentModel.findById.mockResolvedValue({ id: 'a1' });
    noteModel.findByAppointment.mockResolvedValue([]);
    const lista = await noteService.listarPorConsulta('a1', 'user1');
    expect(lista).toHaveLength(0);
  });
});

describe('noteService.criar', () => {
  beforeEach(() => jest.clearAllMocks());

  it('cria anotacao com sucesso', async () => {
    appointmentModel.findById.mockResolvedValue({ id: 'a1' });
    noteModel.create.mockResolvedValue({ id: '1', content: 'Evolucao' });
    const nota = await noteService.criar('a1', 'user1', 'Evolucao');
    expect(nota.content).toBe('Evolucao');
  });

  it('rejeita conteudo vazio', async () => {
    await expect(noteService.criar('a1', 'user1', ''))
      .rejects.toMatchObject({ status: 400 });
  });
});
