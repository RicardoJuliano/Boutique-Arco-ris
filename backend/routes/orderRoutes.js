const express = require('express');
const router  = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware  = require('../middlewares/authMiddleware');
const csrfMiddleware  = require('../middlewares/csrfMiddleware');

router.use(authMiddleware);

router.post('/',    csrfMiddleware, orderController.create);
router.get('/',     orderController.list);
router.get('/:id',  orderController.getById);

module.exports = router;
