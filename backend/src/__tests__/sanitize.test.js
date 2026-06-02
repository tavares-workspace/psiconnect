const sanitize = require('../middlewares/sanitizeMiddleware');

function mockReqRes(body) {
  const req  = { body };
  const res  = {};
  const next = jest.fn();
  return { req, res, next };
}

describe('sanitizeMiddleware', () => {
  it('remove tags HTML do body', () => {
    const { req, res, next } = mockReqRes({ name: '<script>alert(1)</script>Nathan' });
    sanitize(req, res, next);
    expect(req.body.name).not.toContain('<script>');
    expect(next).toHaveBeenCalled();
  });

  it('faz trim em strings', () => {
    const { req, res, next } = mockReqRes({ name: '   Nathan   ' });
    sanitize(req, res, next);
    expect(req.body.name).toBe('Nathan');
    expect(next).toHaveBeenCalled();
  });

  it('mantém campos não-string intactos', () => {
    const { req, res, next } = mockReqRes({ ativo: true, valor: 100 });
    sanitize(req, res, next);
    expect(req.body.ativo).toBe(true);
    expect(req.body.valor).toBe(100);
    expect(next).toHaveBeenCalled();
  });

  it('remove caracteres < e >', () => {
    const { req, res, next } = mockReqRes({ nome: '<Nathan>' });
    sanitize(req, res, next);
    expect(req.body.nome).not.toContain('<');
    expect(req.body.nome).not.toContain('>');
    expect(next).toHaveBeenCalled();
  });
});
