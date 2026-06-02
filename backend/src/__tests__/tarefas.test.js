const request = require('supertest');
const app     = require('../app');

describe('GET /api/tarefas', () => {
  it('rejeita sem token', async () => {
    const res = await request(app).get('/api/tarefas');
    expect(res.status).toBe(401);
  });

  it('rejeita token inválido', async () => {
    const res = await request(app)
      .get('/api/tarefas')
      .set('Authorization', 'Bearer invalido');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/tarefas/:id/concluir', () => {
  it('rejeita sem token', async () => {
    const res = await request(app)
      .patch('/api/tarefas/00000000-0000-0000-0000-000000000000/concluir');
    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/tarefas/:id', () => {
  it('rejeita sem token', async () => {
    const res = await request(app)
      .delete('/api/tarefas/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(401);
  });
});
