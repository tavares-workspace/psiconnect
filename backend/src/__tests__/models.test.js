jest.mock('../config/database');

const pool = require('../config/database');

describe('userModel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('findByEmail retorna usuario', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: '1', email: 'a@a.com' }] });
    const userModel = require('../models/userModel');
    const u = await userModel.findByEmail('a@a.com');
    expect(u.email).toBe('a@a.com');
  });

  it('findByEmail retorna null quando nao encontra', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const userModel = require('../models/userModel');
    const u = await userModel.findByEmail('nao@existe.com');
    expect(u).toBeNull();
  });

  it('findById retorna usuario', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: '1', name: 'Nathan' }] });
    const userModel = require('../models/userModel');
    const u = await userModel.findById('1');
    expect(u.name).toBe('Nathan');
  });

  it('create retorna usuario criado', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: '1', name: 'Nathan', email: 'n@n.com' }] });
    const userModel = require('../models/userModel');
    const u = await userModel.create('Nathan', 'n@n.com', 'hash', '', '');
    expect(u.id).toBe('1');
  });

  it('update retorna usuario atualizado', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: '1', name: 'Novo Nome' }] });
    const userModel = require('../models/userModel');
    const u = await userModel.update('1', 'Novo Nome', '', '');
    expect(u.name).toBe('Novo Nome');
  });
});

describe('patientModel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('findAll retorna lista de pacientes', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: '1', name: 'Ana' }] });
    const patientModel = require('../models/patientModel');
    const lista = await patientModel.findAll('user1', '');
    expect(lista).toHaveLength(1);
  });

  it('findById retorna paciente', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 'p1', name: 'Ana' }] });
    const patientModel = require('../models/patientModel');
    const p = await patientModel.findById('p1', 'user1');
    expect(p.name).toBe('Ana');
  });

  it('findById retorna null quando nao existe', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const patientModel = require('../models/patientModel');
    const p = await patientModel.findById('999', 'user1');
    expect(p).toBeNull();
  });

  it('create retorna paciente criado', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: '1', name: 'Ana', funil_etapa: 'Interessado' }] });
    const patientModel = require('../models/patientModel');
    const p = await patientModel.create('user1', 'Ana', '', '', null, '', '', '');
    expect(p.funil_etapa).toBe('Interessado');
  });

  it('countActive retorna contagem', async () => {
    pool.query.mockResolvedValue({ rows: [{ count: '5' }] });
    const patientModel = require('../models/patientModel');
    const n = await patientModel.countActive('user1');
    expect(n).toBe(5);
  });
});

describe('reminderModel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('findAll retorna lembretes', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: '1', title: 'Lembrete' }] });
    const reminderModel = require('../models/reminderModel');
    const lista = await reminderModel.findAll('user1');
    expect(lista).toHaveLength(1);
  });

  it('create retorna lembrete criado', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: '1', title: 'Teste', done: false }] });
    const reminderModel = require('../models/reminderModel');
    const l = await reminderModel.create('user1', 'Teste', '', '2027-01-01', false);
    expect(l.title).toBe('Teste');
  });

  it('findById retorna lembrete', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: '1', title: 'Lembrete' }] });
    const reminderModel = require('../models/reminderModel');
    const l = await reminderModel.findById('1', 'user1');
    expect(l.title).toBe('Lembrete');
  });
});

describe('tarefaModel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('findPendentes retorna tarefas', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: '1', titulo: 'Preencher prontuario' }] });
    const tarefaModel = require('../models/tarefaModel');
    const lista = await tarefaModel.findPendentes('user1');
    expect(lista).toHaveLength(1);
  });

  it('existePendente retorna false', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const tarefaModel = require('../models/tarefaModel');
    const existe = await tarefaModel.existePendente('user1', 'p1', 'prontuario');
    expect(existe).toBe(false);
  });

  it('existePendente retorna true', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: '1' }] });
    const tarefaModel = require('../models/tarefaModel');
    const existe = await tarefaModel.existePendente('user1', 'p1', 'prontuario');
    expect(existe).toBe(true);
  });
});

describe('appointmentModel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('findById retorna consulta', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 'a1', status: 'scheduled' }] });
    const appointmentModel = require('../models/appointmentModel');
    const c = await appointmentModel.findById('a1', 'user1');
    expect(c.status).toBe('scheduled');
  });

  it('findById retorna null quando nao existe', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const appointmentModel = require('../models/appointmentModel');
    const c = await appointmentModel.findById('999', 'user1');
    expect(c).toBeNull();
  });

  it('findAll retorna lista de consultas', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 'a1' }, { id: 'a2' }] });
    const appointmentModel = require('../models/appointmentModel');
    const lista = await appointmentModel.findAll('user1', null, null, null, null);
    expect(lista).toHaveLength(2);
  });

  it('create retorna consulta criada', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 'a1', status: 'scheduled' }] });
    const appointmentModel = require('../models/appointmentModel');
    const a = await appointmentModel.create('user1', 'p1', '2027-01-01T10:00', null, null);
    expect(a.status).toBe('scheduled');
  });

  it('updateStatus retorna consulta atualizada', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 'a1', status: 'completed' }] });
    const appointmentModel = require('../models/appointmentModel');
    const a = await appointmentModel.updateStatus('a1', 'user1', 'completed');
    expect(a.status).toBe('completed');
  });

  it('cancelOne retorna consulta cancelada', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 'a1', status: 'cancelled' }] });
    const appointmentModel = require('../models/appointmentModel');
    const a = await appointmentModel.cancelOne('a1', 'user1');
    expect(a.status).toBe('cancelled');
  });
});

describe('prontuarioModel criptografia', () => {
  it('encrypt e decrypt sao inversos', () => {
    process.env.CRYPTO_KEY = 'chave-de-teste-segura-32-chars!!';
    const { encrypt, decrypt } = require('../models/prontuarioModel');
    const texto = 'Evolucao clinica do paciente';
    const cifrado = encrypt(texto);
    expect(cifrado).not.toBe(texto);
    const decifrado = decrypt(cifrado);
    expect(decifrado).toBe(texto);
  });
});

describe('noteModel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('findByAppointment retorna notas', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: '1', content: 'Nota' }] });
    const noteModel = require('../models/noteModel');
    const notas = await noteModel.findByAppointment('a1');
    expect(notas).toHaveLength(1);
  });

  it('create retorna nota criada', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: '1', content: 'Nova nota' }] });
    const noteModel = require('../models/noteModel');
    const nota = await noteModel.create('a1', 'Nova nota');
    expect(nota.content).toBe('Nova nota');
  });
});
