const { z } = require('zod');
const { isValidCPF } = require('../utils/cpfValidator');

exports.registerSchema = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(2, 'Nome deve ter ao menos 2 caracteres')
    .max(100, 'Nome não pode ter mais de 100 caracteres')
    .trim(),

  email: z
    .string({ required_error: 'Email é obrigatório' })
    .email('Email inválido')
    .toLowerCase(),

  cpf: z
    .string({ required_error: 'CPF é obrigatório' })
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 11, 'CPF inválido')
    .refine((val) => isValidCPF(val), 'CPF inválido'),

  // max 72: bcrypt trunca senhas maiores silenciosamente, causando falhas inesperadas no login
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(72, 'Senha não pode ter mais de 72 caracteres'),
});

exports.loginSchema = z.object({
  email: z
    .string({ required_error: 'Email é obrigatório' })
    .email('Email inválido')
    .toLowerCase(),

  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(1, 'Senha não pode estar vazia'),
});
