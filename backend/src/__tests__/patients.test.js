const request = require('supertest');
const app     = require('../app');

describe('GET /api/patients', () => {
  it('rejeita sem token', async () => {
    const res = await request(app).get('/api/patients');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/patients', () => {
  it('rejeita sem token', async () => {
    const res = await request(app)
      .post('/api/patients')
      .send({ name: 'Teste' });
    expect(res.status).toBe(401);
  });

  it('rejeita token inválido', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', 'Bearer tokeninvalido')
      .send({ name: 'Teste' });
    expect(res.status).toBe(401);
  });
});
