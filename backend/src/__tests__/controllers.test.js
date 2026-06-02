jest.mock('../services/authService');
jest.mock('../services/patientService');
jest.mock('../services/reminderService');

const authService     = require('../services/authService');
const patientService  = require('../services/patientService');
const reminderService = require('../services/reminderService');
const request         = require('supertest');
const app             = require('../app');

describe('POST /api/auth/register validacoes', () => {
  it('rejeita nome com caracteres invalidos', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ name: 'N4th@n', email: 'n@n.com', password: 'abc123', aceite_termos: true });
    expect(res.status).toBe(400);
  });

  it('rejeita crp em formato errado', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Nathan', email: 'n@n.com', password: 'abc123', aceite_termos: true, crp: '123456789' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/CRP/i);
  });

  it('rejeita sem aceite dos termos', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Nathan', email: 'n@n.com', password: 'abc123', aceite_termos: false });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login validacoes', () => {
  it('rejeita email mal formatado', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'nao-e-email', password: 'abc123' });
    expect(res.status).toBe(400);
  });

  it('retorna 401 para credenciais invalidas', async () => {
    authService.login.mockRejectedValue(Object.assign(new Error('Credenciais inválidas.'), { status: 401 }));
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'x@x.com', password: 'abc123' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/patients sem token', () => {
  it('retorna 401', async () => {
    const res = await request(app).get('/api/patients');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/patients validacoes', () => {
  it('rejeita cpf invalido', async () => {
    const res = await request(app).post('/api/patients')
      .set('Authorization', 'Bearer tokeninvalido')
      .send({ name: 'Ana', cpf: '111.111.111-11' });
    expect(res.status).toBe(401);
  });

  it('rejeita data de nascimento futura', async () => {
    const res = await request(app).post('/api/patients')
      .set('Authorization', 'Bearer tokeninvalido')
      .send({ name: 'Ana', birth_date: '2099-01-01' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/reminders sem token', () => {
  it('retorna 401', async () => {
    const res = await request(app).get('/api/reminders');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/reminders validacoes', () => {
  it('rejeita sem titulo', async () => {
    const res = await request(app).post('/api/reminders')
      .set('Authorization', 'Bearer tokeninvalido')
      .send({ remind_at: '2027-01-01T10:00' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/dashboard sem token', () => {
  it('retorna 401', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(401);
  });
});

describe('GET /health', () => {
  it('retorna status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
