require('dotenv').config();

const requiredEnvVars = ['JWT_SECRET', 'ANTHROPIC_API_KEY', 'FRONTEND_URL', 'DATABASE_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`[FATAL] Variável de ambiente obrigatória não definida: ${envVar}`);
    // process.exit apenas quando rodando diretamente; em serverless lança erro de rota
    if (require.main === module) process.exit(1);
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
const { isAllowedOrigin } = require('./config/allowedOrigins');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({ contentSecurityPolicy: true }));

app.use(cors({
  origin(origin, callback) {
    if (!origin || isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    console.error('[cors-debug] origin recebida=%j FRONTEND_URL=%j NODE_ENV=%j', origin, process.env.FRONTEND_URL, process.env.NODE_ENV);
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
}));

app.use(cookieParser());
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

app.use(errorMiddleware);

// Bootstrap: garante que ADMIN_EMAIL sempre tenha is_admin=true
if (process.env.ADMIN_EMAIL) {
  const pool = require('./config/database');
  pool.query('UPDATE users SET is_admin = true WHERE email = $1 AND is_admin = false', [process.env.ADMIN_EMAIL])
    .catch((err) => console.warn('[server] Admin bootstrap skipped:', err.message));
}

// Só escuta quando executado diretamente (não em ambiente serverless)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[server] Boutique Arco-Íris API rodando em http://localhost:${PORT}`);
    console.log(`[server] Ambiente: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
