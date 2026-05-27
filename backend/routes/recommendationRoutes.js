const express = require('express');
const router = express.Router();

const recommendationController = require('../controllers/recommendationController');
const authMiddleware = require('../middlewares/authMiddleware');
const csrfMiddleware = require('../middlewares/csrfMiddleware');
const { recommendationLimiter } = require('../middlewares/rateLimiter');

router.post('/', authMiddleware, recommendationLimiter, csrfMiddleware, recommendationController.create);
router.get('/history', authMiddleware, recommendationController.history);

module.exports = router;
