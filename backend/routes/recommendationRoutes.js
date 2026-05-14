/**
 * routes/recommendationRoutes.js
 * Todas as rotas aqui são protegidas — exigem JWT válido no cookie.
 * A ordem dos middlewares importa: auth → rate limit → csrf → controller.
 * Se auth falhar, as camadas seguintes não são executadas (fail fast).
 */

const express = require('express');
const router = express.Router();

const recommendationController = require('../controllers/recommendationController');
const authMiddleware = require('../middlewares/authMiddleware');
const csrfMiddleware = require('../middlewares/csrfMiddleware');
const { recommendationLimiter } = require('../middlewares/rateLimiter');

// POST /api/recommendations — gerar novas recomendações via IA
// Protegido por: autenticação + rate limit + validação CSRF
router.post(
  '/',
  authMiddleware,
  recommendationLimiter,
  csrfMiddleware,
  recommendationController.create
);

// GET /api/recommendations/history — histórico de consultas do usuário
// Apenas autenticação necessária — GET é idempotente, sem risco CSRF
router.get('/history', authMiddleware, recommendationController.history);

module.exports = router;
