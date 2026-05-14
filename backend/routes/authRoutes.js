/**
 * routes/authRoutes.js
 * Define as rotas de autenticação e aplica os middlewares corretos.
 * Rotas públicas (sem authMiddleware) — qualquer pessoa pode acessar.
 */

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { loginLimiter, registerLimiter } = require('../middlewares/rateLimiter');

// POST /api/auth/register — criar nova conta (com rate limit anti-spam)
router.post('/register', registerLimiter, authController.register);

// POST /api/auth/login — autenticar usuário (com rate limit anti-brute force)
router.post('/login', loginLimiter, authController.login);

// POST /api/auth/logout — invalidar sessão (limpa cookie)
router.post('/logout', authController.logout);

// GET /api/auth/me — retornar dados do usuário autenticado (rota protegida)
// Usado pelo frontend para restaurar estado de auth após reload da página
router.get('/me', authMiddleware, authController.me);

module.exports = router;
