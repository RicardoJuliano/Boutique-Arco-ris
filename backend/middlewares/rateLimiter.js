/**
 * middlewares/rateLimiter.js
 * Rate limiters por tipo de rota para proteção contra abuso.
 * express-rate-limit usa um store em memória por padrão — suficiente para
 * portfólio/single-instance. Em produção multi-instância, usar Redis store.
 */

const rateLimit = require('express-rate-limit');

// Login: 5 tentativas por minuto por IP
// Bloqueia ataques de força bruta sem prejudicar usuários legítimos
// (errar a senha 5 vezes em 1 minuto é comportamento atípico)
exports.loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,  // inclui Rate-Limit-* headers na resposta
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Aguarde 1 minuto.' },
});

// Registro: 3 novos cadastros por minuto por IP
// Previne criação em massa de contas falsas (bots de spam)
exports.registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitos cadastros. Aguarde 1 minuto.' },
});

// Recomendações: 10 consultas por minuto por IP
// Cada consulta custa tokens na Anthropic API — limitar protege o orçamento
// e evita uso abusivo da IA por parte de um único usuário
exports.recommendationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas consultas. Aguarde 1 minuto.' },
});
