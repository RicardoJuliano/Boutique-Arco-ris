/**
 * validators/authValidator.js
 * Schemas Zod para validação de entradas nas rotas de autenticação.
 * Zod lança ZodError com detalhes de cada campo inválido — o errorMiddleware
 * captura e devolve as mensagens ao cliente sem expor stack traces.
 *
 * Por que Zod?
 *   - Validação e tipagem em um só lugar
 *   - Mensagens de erro descritivas por padrão
 *   - parse() lança se inválido; safeParse() retorna { success, error } — usamos
 *     parse() nos controllers para deixar o errorMiddleware centralizar o tratamento
 */

const { z } = require('zod');

// Registro: exige nome, email válido e senha com política mínima
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

  // max: 72 é o limite do bcrypt — senhas maiores são truncadas silenciosamente,
  // o que causaria falhas inesperadas no login. Bloquear no input previne isso.
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(72, 'Senha não pode ter mais de 72 caracteres'),
});

// Login: apenas email e senha (não validar força da senha aqui — evitar
// revelar política para atacantes via mensagens de erro diferenciadas)
exports.loginSchema = z.object({
  email: z
    .string({ required_error: 'Email é obrigatório' })
    .email('Email inválido')
    .toLowerCase(),

  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(1, 'Senha não pode estar vazia'),
});
