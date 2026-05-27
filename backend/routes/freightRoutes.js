const express = require('express');
const router = express.Router();

const ORIGIN_CEP = process.env.ORIGIN_CEP || '39230000';

// Zonas postais a partir de Buenópolis/MG — tabela Correios 2025
const ZONES = {
  MG: { zone: 1, pacDays: [1, 3],  sedexDays: [1, 1] },
  SP: { zone: 1, pacDays: [2, 4],  sedexDays: [1, 2] },
  RJ: { zone: 1, pacDays: [2, 4],  sedexDays: [1, 2] },
  ES: { zone: 1, pacDays: [3, 5],  sedexDays: [1, 2] },
  BA: { zone: 2, pacDays: [3, 5],  sedexDays: [1, 2] },
  GO: { zone: 2, pacDays: [4, 6],  sedexDays: [2, 3] },
  DF: { zone: 2, pacDays: [4, 6],  sedexDays: [2, 3] },
  PR: { zone: 2, pacDays: [4, 6],  sedexDays: [2, 3] },
  SC: { zone: 3, pacDays: [5, 8],  sedexDays: [2, 3] },
  RS: { zone: 3, pacDays: [6, 9],  sedexDays: [3, 4] },
  MS: { zone: 3, pacDays: [5, 7],  sedexDays: [2, 3] },
  MT: { zone: 3, pacDays: [6, 9],  sedexDays: [3, 4] },
  SE: { zone: 3, pacDays: [5, 8],  sedexDays: [2, 3] },
  AL: { zone: 3, pacDays: [6, 9],  sedexDays: [3, 4] },
  PE: { zone: 3, pacDays: [6, 9],  sedexDays: [3, 4] },
  PB: { zone: 4, pacDays: [7, 11], sedexDays: [3, 5] },
  RN: { zone: 4, pacDays: [7, 11], sedexDays: [3, 5] },
  CE: { zone: 4, pacDays: [7, 11], sedexDays: [3, 5] },
  PI: { zone: 4, pacDays: [8, 12], sedexDays: [4, 5] },
  TO: { zone: 4, pacDays: [7, 11], sedexDays: [3, 5] },
  MA: { zone: 4, pacDays: [9, 13], sedexDays: [4, 6] },
  PA: { zone: 5, pacDays: [10,14], sedexDays: [5, 7] },
  AP: { zone: 5, pacDays: [11,15], sedexDays: [5, 7] },
  AM: { zone: 5, pacDays: [13,17], sedexDays: [5, 7] },
  RR: { zone: 5, pacDays: [13,17], sedexDays: [5, 7] },
  AC: { zone: 5, pacDays: [13,17], sedexDays: [5, 7] },
  RO: { zone: 5, pacDays: [11,15], sedexDays: [5, 7] },
};

// Tabela Correios 2025 — faixas: até 500g | até 1kg | até 2kg | acima de 2kg
const PAC_PRICES = {
  1: [18.50, 21.20, 25.40, 31.80],
  2: [21.60, 24.90, 30.20, 38.70],
  3: [26.20, 30.80, 38.50, 50.40],
  4: [31.90, 38.20, 49.20, 66.10],
  5: [39.80, 48.90, 64.50, 89.30],
};

const SEDEX_PRICES = {
  1: [23.30, 28.20, 35.10, 44.80],
  2: [28.20, 34.70, 44.60, 58.90],
  3: [36.00, 45.00, 58.90, 79.40],
  4: [47.20, 60.30, 80.60, 111.20],
  5: [66.50, 86.30, 118.40, 167.50],
};

function getWeightIndex(itemCount) {
  const kg = Math.max(1, Number(itemCount)) * 0.4; // ~400g por peça
  if (kg <= 0.5) return 0;
  if (kg <= 1.0) return 1;
  if (kg <= 2.0) return 2;
  return 3;
}

router.get('/', async (req, res, next) => {
  try {
    const { cep, items = 1 } = req.query;
    const cleanCep = String(cep || '').replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      return res.status(400).json({ error: 'CEP inválido. Informe 8 dígitos.' });
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'Serviço de CEP indisponível. Tente novamente.' });
    }

    const data = await response.json();

    if (data.erro) {
      return res.status(404).json({ error: 'CEP não encontrado. Verifique e tente novamente.' });
    }

    const stateCode = data.uf;
    const zoneConfig = ZONES[stateCode] ?? { zone: 3, pacDays: [7, 10], sedexDays: [3, 5] };
    const weightIndex = getWeightIndex(items);

    res.json({
      address: {
        street:   data.logradouro || '',
        district: data.bairro     || '',
        city:     data.localidade || '',
        state:    data.uf         || '',
        zip:      data.cep        || cleanCep,
      },
      shipping: {
        pac: {
          code:  '04510',
          price: PAC_PRICES[zoneConfig.zone][weightIndex],
          label: `PAC — ${zoneConfig.pacDays[0]} a ${zoneConfig.pacDays[1]} dias úteis`,
          days:  zoneConfig.pacDays[1],
        },
        sedex: {
          code:  '04014',
          price: SEDEX_PRICES[zoneConfig.zone][weightIndex],
          label: `SEDEX — ${zoneConfig.sedexDays[0]} a ${zoneConfig.sedexDays[1]} dias úteis`,
          days:  zoneConfig.sedexDays[1],
        },
      },
    });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      return res.status(504).json({ error: 'Tempo esgotado ao consultar CEP. Tente novamente.' });
    }
    next(err);
  }
});

module.exports = router;
