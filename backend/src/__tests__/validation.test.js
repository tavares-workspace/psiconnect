const { schemas } = require('../middlewares/validateMiddleware');

describe('register', () => {
  it('aceita dados válidos', () => {
    const { error } = schemas.register.validate({
      name: 'Nathan Silva', email: 'nathan@email.com', password: 'abc123', aceite_termos: true
    });
    expect(error).toBeUndefined();
  });

  it('rejeita sem nome', () => {
    const { error } = schemas.register.validate({
      email: 'a@a.com', password: '123456'
    });
    expect(error).toBeDefined();
  });

  it('rejeita e-mail inválido', () => {
    const { error } = schemas.register.validate({
      name: 'Nathan', email: 'invalido', password: '123456'
    });
    expect(error).toBeDefined();
  });

  it('rejeita senha curta', () => {
    const { error } = schemas.register.validate({
      name: 'Nathan', email: 'n@email.com', password: '123'
    });
    expect(error).toBeDefined();
  });
});

describe('patient', () => {
  it('aceita nome válido', () => {
    const { error } = schemas.patient.validate({ name: 'Ana' });
    expect(error).toBeUndefined();
  });

  it('rejeita e-mail inválido', () => {
    const { error } = schemas.patient.validate({ name: 'Ana', email: 'nao-email' });
    expect(error).toBeDefined();
  });

  it('rejeita sem nome', () => {
    const { error } = schemas.patient.validate({ email: 'a@a.com' });
    expect(error).toBeDefined();
  });
});

describe('appointment', () => {
  it('aceita dados válidos', () => {
    const { error } = schemas.appointment.validate({
      patient_id:   '00000000-0000-0000-0000-000000000000',
      scheduled_at: new Date().toISOString(),
    });
    expect(error).toBeUndefined();
  });

  it('rejeita recorrência inválida', () => {
    const { error } = schemas.appointment.validate({
      patient_id:   '00000000-0000-0000-0000-000000000000',
      scheduled_at: new Date().toISOString(),
      recorrencia:  'diaria',
    });
    expect(error).toBeDefined();
  });

  it('rejeita UUID inválido', () => {
    const { error } = schemas.appointment.validate({
      patient_id:   'nao-uuid',
      scheduled_at: new Date().toISOString(),
    });
    expect(error).toBeDefined();
  });

  it('rejeita sem patient_id', () => {
    const { error } = schemas.appointment.validate({
      scheduled_at: new Date().toISOString(),
    });
    expect(error).toBeDefined();
  });
});
