const express = require('express');
const multer = require('multer');
const router = express.Router();

const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const csrfMiddleware = require('../middlewares/csrfMiddleware');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, ALLOWED_MIME_TYPES.includes(file.mimetype)),
});

router.use(authMiddleware);
router.use(adminMiddleware);
router.use(csrfMiddleware);

router.get('/products', adminController.listProducts);
router.get('/products/:id', adminController.getProduct);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.post('/products/upload', upload.single('image'), adminController.uploadImage);

module.exports = router;
