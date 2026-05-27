const express = require('express');
const router = express.Router();
const productRepository = require('../repositories/productRepository');

router.get('/', (_req, res, next) => {
  try {
    const products = productRepository.findActive();
    res.json({ products });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const product = productRepository.findById(Number(req.params.id));
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
