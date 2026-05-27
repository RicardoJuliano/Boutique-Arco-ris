require('dotenv').config();

const requiredEnvVars = ['JWT_SECRET', 'ANTHROPIC_API_KEY', 'FRONTEND_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`[FATAL] Variável de ambiente obrigatória não definida: ${envVar}`);
    process.exit(1);
  }
}

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const freightRoutes = require('./routes/freightRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({ contentSecurityPolicy: true }));

// credentials: true é obrigatório para que o browser envie cookies cross-origin
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

app.use(cookieParser());

// limit reduz superfície de ataque contra payloads gigantes
app.use(express.json({ limit: '10kb' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/freight', freightRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// error middleware DEVE ser o último — Express exige 4 parâmetros para identificar handlers de erro
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`[server] Boutique Arco-Íris API rodando em http://localhost:${PORT}`);
  console.log(`[server] Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
