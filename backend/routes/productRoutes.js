const express = require('express');
const productRepository = require('../repositories/productRepository');
const router = express.Router();

router.get('/', (_req, res) => {
  res.json(productRepository.findActive());
});

router.get('/:id', (req, res) => {
  const product = productRepository.findById(Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
  res.json(product);
});

module.exports = router;
