const { validate, schemas } = require('../middlewares/validateMiddleware');

function mockNext() { return jest.fn(); }
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

describe('validate middleware', () => {
  it('chama next quando dados validos', () => {
    const req  = { body: { name: 'Nathan', email: 'n@n.com', password: 'abc123', aceite_termos: true } };
    const res  = mockRes();
    const next = mockNext();
    validate(schemas.register)(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('retorna 400 quando dados invalidos', () => {
    const req  = { body: { email: 'invalido' } };
    const res  = mockRes();
    const next = mockNext();
    validate(schemas.register)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('valida login corretamente', () => {
    const req  = { body: { email: 'a@a.com', password: 'abc123' } };
    const res  = mockRes();
    const next = mockNext();
    validate(schemas.login)(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('valida paciente corretamente', () => {
    const req  = { body: { name: 'Ana Silva' } };
    const res  = mockRes();
    const next = mockNext();
    validate(schemas.patient)(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('rejeita agendamento sem patient_id', () => {
    const req  = { body: { scheduled_at: '2027-01-01T10:00' } };
    const res  = mockRes();
    const next = mockNext();
    validate(schemas.appointment)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('valida lembrete corretamente', () => {
    const req  = { body: { title: 'Lembrete', remind_at: '2027-01-01T10:00' } };
    const res  = mockRes();
    const next = mockNext();
    validate(schemas.reminder)(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('sanitizeMiddleware', () => {
  const sanitize = require('../middlewares/sanitizeMiddleware');

  it('remove tags HTML', () => {
    const req  = { body: { name: '<script>alert(1)</script>Nathan' } };
    const next = mockNext();
    sanitize(req, {}, next);
    expect(req.body.name).not.toContain('<script>');
    expect(next).toHaveBeenCalled();
  });

  it('aplica trim em strings', () => {
    const req  = { body: { name: '  Nathan  ' } };
    const next = mockNext();
    sanitize(req, {}, next);
    expect(req.body.name).toBe('Nathan');
  });

  it('preserva campos nao-string', () => {
    const req  = { body: { ativo: true, valor: 42 } };
    const next = mockNext();
    sanitize(req, {}, next);
    expect(req.body.ativo).toBe(true);
    expect(req.body.valor).toBe(42);
  });
});
