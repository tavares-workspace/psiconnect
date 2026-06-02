const Joi = require('joi');

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const mensagens = error.details.map(d => d.message);
      return res.status(400).json({ message: mensagens.join('. ') });
    }
    next();
  };
}

function validarCPF(cpf) {
  if (!cpf) return true;
  const nums = cpf.replace(/\D/g, '');
  if (nums.length !== 11) return false;
  if (/^(\d)\1+$/.test(nums)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(nums[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(nums[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(nums[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(nums[10]);
}

const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(150)
      .pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
      .required()
      .messages({
        'string.min':     'Nome deve ter ao menos 2 caracteres.',
        'string.pattern.base': 'Nome deve conter apenas letras.',
        'any.required':   'Nome é obrigatório.',
      }),
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
      'string.email':  'E-mail inválido.',
      'any.required':  'E-mail é obrigatório.',
    }),
    password: Joi.string().min(6).max(100)
      .pattern(/^(?=.*[a-zA-Z])(?=.*[0-9])/)
      .required()
      .messages({
        'string.min':          'Senha deve ter ao menos 6 caracteres.',
        'string.max':          'Senha deve ter no máximo 100 caracteres.',
        'string.pattern.base': 'Senha deve conter ao menos uma letra e um número.',
        'any.required':        'Senha é obrigatória.',
      }),
    crp: Joi.string()
      .pattern(/^\d{2}\/\d{4,6}$/)
      .optional().allow('', null)
      .messages({ 'string.pattern.base': 'CRP inválido. Use o formato 00/00000.' }),
    phone: Joi.string()
      .pattern(/^[\d\s()\-+]{8,20}$/)
      .optional().allow('', null)
      .messages({ 'string.pattern.base': 'Telefone inválido. Use o formato (11) 99999-9999.' }),
    aceite_termos: Joi.boolean().valid(true).required().messages({
      'any.only':    'É necessário aceitar os Termos de Uso e a Política de Privacidade.',
      'any.required':'É necessário aceitar os Termos de Uso e a Política de Privacidade.',
    }),
  }),

  login: Joi.object({
    email:    Joi.string().email({ tlds: { allow: false } }).required().messages({
      'string.email':  'E-mail inválido.',
      'any.required':  'E-mail é obrigatório.',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Senha é obrigatória.',
    }),
  }),

  patient: Joi.object({
    name: Joi.string().min(2).max(150)
      .pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
      .required()
      .messages({
        'string.min':          'Nome deve ter ao menos 2 caracteres.',
        'string.pattern.base': 'Nome deve conter apenas letras.',
        'any.required':        'Nome é obrigatório.',
      }),
    email: Joi.string().email({ tlds: { allow: false } }).optional().allow('', null).messages({
      'string.email':   'E-mail inválido.',
      'string.base':    'E-mail inválido.',
    }),
    phone: Joi.string()
      .pattern(/^[\d\s\(\)\-\+]{8,20}$/)
      .optional().allow('', null)
      .messages({ 'string.pattern.base': 'Telefone inválido. Digite apenas números e caracteres válidos.' }),
    birth_date: Joi.date().max('now').optional().allow(null).messages({
      'date.max': 'Data de nascimento não pode ser futura.',
    }),
    cpf: Joi.string().optional().allow('', null)
      .custom((val, helpers) => {
        if (!val) return val;
        if (!validarCPF(val)) return helpers.error('any.invalid');
        return val;
      })
      .messages({ 'any.invalid': 'CPF inválido.' }),
    address: Joi.string().min(5).max(255).optional().allow('', null).messages({
      'string.min': 'Endereço deve ter ao menos 5 caracteres.',
      'string.max': 'Endereço deve ter no máximo 255 caracteres.',
    }),
    notes: Joi.string().max(2000).optional().allow('', null).messages({
      'string.max': 'Observações devem ter no máximo 2000 caracteres.',
    }),
  }),

  appointment: Joi.object({
    patient_id: Joi.string().uuid().required().messages({
      'any.required': 'Paciente é obrigatório.',
      'string.uuid':  'Paciente inválido.',
    }),
    scheduled_at: Joi.string().required().messages({
      'any.required': 'Data e hora são obrigatórios.',
      'string.base':  'Data e hora inválidos.',
    }),
    recorrencia: Joi.string().valid('semanal', 'quinzenal', 'mensal').optional().allow('', null).messages({
      'any.only': 'Tipo de recorrência inválido.',
    }),
    status: Joi.string().valid('scheduled', 'completed', 'cancelled').optional(),
  }),

  reminder: Joi.object({
    title:       Joi.string().min(1).max(200).required().messages({
      'any.required': 'Título é obrigatório.',
      'string.max':   'Título deve ter no máximo 200 caracteres.',
    }),
    description: Joi.string().max(1000).optional().allow('', null),
    remind_at:   Joi.string().required().messages({
      'any.required': 'Data e hora são obrigatórios.',
      'string.base':  'Data e hora inválidos.',
    }),
    done: Joi.boolean().optional(),
  }),
};

// Mensagens padrão globais em português para tipos não cobertos individualmente
Joi.defaults = (schema) => schema.messages({
  'string.base':     'O campo deve ser um texto.',
  'string.empty':    'O campo não pode ficar vazio.',
  'number.base':     'O campo deve ser um número.',
  'date.base':       'Data inválida.',
  'boolean.base':    'Valor inválido.',
  'any.required':    'Campo obrigatório.',
  'any.only':        'Valor não permitido.',
});

module.exports = { validate, schemas };
