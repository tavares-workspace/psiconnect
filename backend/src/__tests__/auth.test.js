const request = require('supertest');
const app     = require('../app');

describe('POST /api/auth/register', () => {
  it('rejeita cadastro sem nome', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'teste@email.com', password: '123456' });
    expect(res.status).toBe(400);
  });

  it('rejeita e-mail inválido', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Teste', email: 'nao-email', password: '123456' });
    expect(res.status).toBe(400);
  });

  it('rejeita senha curta', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Teste', email: 'teste@email.com', password: '12' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('rejeita sem e-mail', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: '123456' });
    expect(res.status).toBe(400);
  });

  it('rejeita sem senha', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'teste@email.com' });
    expect(res.status).toBe(400);
  });
});
