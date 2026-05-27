const rateLimit = require('express-rate-limit');

exports.loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Aguarde 1 minuto.' },
});

exports.registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitos cadastros. Aguarde 1 minuto.' },
});

// Limita tokens Anthropic consumidos por IP
exports.recommendationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas consultas. Aguarde 1 minuto.' },
});
