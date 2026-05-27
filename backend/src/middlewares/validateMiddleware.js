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

const schemas = {
  register: Joi.object({
    name:     Joi.string().min(2).max(150).required().messages({
      'string.min':  'Nome deve ter ao menos 2 caracteres.',
      'any.required':'Nome é obrigatório.',
    }),
    email:    Joi.string().email().required().messages({
      'string.email':'E-mail inválido.',
      'any.required':'E-mail é obrigatório.',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min':  'Senha deve ter ao menos 6 caracteres.',
      'any.required':'Senha é obrigatória.',
    }),
    crp:           Joi.string().max(20).optional().allow(''),
    phone:         Joi.string().max(20).optional().allow(''),
    aceite_termos: Joi.boolean().valid(true).required().messages({
      'any.only':    'É necessário aceitar os Termos de Uso e a Política de Privacidade.',
      'any.required':'É necessário aceitar os Termos de Uso e a Política de Privacidade.',
    }),
  }),

  login: Joi.object({
    email:    Joi.string().email().required().messages({
      'string.email':'E-mail inválido.',
      'any.required':'E-mail é obrigatório.',
    }),
    password: Joi.string().required().messages({
      'any.required':'Senha é obrigatória.',
    }),
  }),

  patient: Joi.object({
    name:       Joi.string().min(2).max(150).required().messages({
      'string.min':  'Nome deve ter ao menos 2 caracteres.',
      'any.required':'Nome é obrigatório.',
    }),
    email:      Joi.string().email().optional().allow('', null),
    phone:      Joi.string().max(20).optional().allow('', null),
    birth_date: Joi.date().optional().allow(null),
    cpf:        Joi.string().max(14).optional().allow('', null),
    address:    Joi.string().max(255).optional().allow('', null),
    notes:      Joi.string().optional().allow('', null),
  }),

  appointment: Joi.object({
    patient_id:   Joi.string().uuid().required().messages({
      'any.required':'Paciente é obrigatório.',
      'string.uuid': 'ID de paciente inválido.',
    }),
    scheduled_at: Joi.string().isoDate().required().messages({
      'any.required':  'Data e hora são obrigatórios.',
      'string.isoDate':'Data e hora inválidos.',
    }),
    recorrencia:  Joi.string().valid('semanal', 'quinzenal', 'mensal').optional().allow('', null),
    status:       Joi.string().valid('scheduled', 'completed', 'cancelled').optional(),
  }),

  reminder: Joi.object({
    title:       Joi.string().min(1).max(200).required().messages({
      'any.required':'Título é obrigatório.',
    }),
    description: Joi.string().optional().allow('', null),
    remind_at:   Joi.string().isoDate().required().messages({
      'any.required':'Data e hora são obrigatórios.',
    }),
    done:        Joi.boolean().optional(),
  }),
};

module.exports = { validate, schemas };
