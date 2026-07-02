const express = require('express');
const router = express.Router();
const { getFreightQuote } = require('../services/freightService');

router.get('/', async (req, res, next) => {
  try {
    const { cep, items = 1 } = req.query;
    const quote = await getFreightQuote(cep, items);
    res.json({ address: quote.address, shipping: quote.shipping });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      return res.status(504).json({ error: 'Tempo esgotado ao consultar CEP. Tente novamente.' });
    }
    next(err);
  }
});

module.exports = router;
