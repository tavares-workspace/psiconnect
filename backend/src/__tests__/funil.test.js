const request = require('supertest');
const app     = require('../app');

describe('GET /api/funil', () => {
  it('rejeita sem token', async () => {
    const res = await request(app).get('/api/funil');
    expect(res.status).toBe(401);
  });

  it('rejeita token inválido', async () => {
    const res = await request(app)
      .get('/api/funil')
      .set('Authorization', 'Bearer invalido');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/funil/:patientId/etapa', () => {
  it('rejeita sem token', async () => {
    const res = await request(app)
      .patch('/api/funil/00000000-0000-0000-0000-000000000000/etapa')
      .send({ etapa: 'Triagem' });
    expect(res.status).toBe(401);
  });

  it('rejeita token inválido', async () => {
    const res = await request(app)
      .patch('/api/funil/00000000-0000-0000-0000-000000000000/etapa')
      .set('Authorization', 'Bearer invalido')
      .send({ etapa: 'Triagem' });
    expect(res.status).toBe(401);
  });
});
