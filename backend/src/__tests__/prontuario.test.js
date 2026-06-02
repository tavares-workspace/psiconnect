const request = require('supertest');
const app     = require('../app');

describe('GET /api/prontuarios/:patientId', () => {
  it('rejeita sem token', async () => {
    const res = await request(app)
      .get('/api/prontuarios/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(401);
  });

  it('rejeita token inválido', async () => {
    const res = await request(app)
      .get('/api/prontuarios/00000000-0000-0000-0000-000000000000')
      .set('Authorization', 'Bearer invalido');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/prontuarios/:patientId', () => {
  it('rejeita sem token', async () => {
    const res = await request(app)
      .post('/api/prontuarios/00000000-0000-0000-0000-000000000000')
      .send({ evolucao: 'Texto de evolução' });
    expect(res.status).toBe(401);
  });

  it('rejeita token inválido', async () => {
    const res = await request(app)
      .post('/api/prontuarios/00000000-0000-0000-0000-000000000000')
      .set('Authorization', 'Bearer invalido')
      .send({ evolucao: 'Texto de evolução' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/prontuarios/:patientId/download-evolucao', () => {
  it('rejeita sem token', async () => {
    const res = await request(app)
      .get('/api/prontuarios/00000000-0000-0000-0000-000000000000/download-evolucao');
    expect(res.status).toBe(401);
  });
});
