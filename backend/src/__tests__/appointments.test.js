const request = require('supertest');
const app     = require('../app');

describe('GET /api/appointments', () => {
  it('rejeita sem token', async () => {
    const res = await request(app).get('/api/appointments');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/appointments', () => {
  it('rejeita sem token', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({ patient_id: '123', scheduled_at: new Date().toISOString() });
    expect(res.status).toBe(401);
  });

  it('rejeita token inválido', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', 'Bearer invalido')
      .send({ scheduled_at: new Date().toISOString() });
    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/appointments/:id', () => {
  it('rejeita sem token', async () => {
    const res = await request(app)
      .delete('/api/appointments/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(401);
  });
});
