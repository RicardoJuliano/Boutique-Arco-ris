const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const csrfMiddleware = require('../middlewares/csrfMiddleware');
const { loginLimiter, registerLimiter } = require('../middlewares/rateLimiter');

router.post('/register', registerLimiter, authController.register);
router.post('/login',    loginLimiter,    authController.login);
router.post('/logout',   csrfMiddleware,  authController.logout);
router.get('/me',        authMiddleware,  authController.me);

module.exports = router;
