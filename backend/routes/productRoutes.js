const express = require('express');
const router = express.Router();
const productRepository = require('../repositories/productRepository');

router.get('/', async (_req, res, next) => {
  try {
    const products = await productRepository.findActive();
    res.json({ products });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await productRepository.findById(Number(req.params.id));
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
