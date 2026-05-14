/**
 * server.js
 * Ponto de entrada da aplicação.
 * Monta o Express com todos os middlewares na ordem correta e sobe o servidor.
 *
 * Ordem dos middlewares IMPORTA:
 *   1. Segurança (helmet, cors, cookieParser) — antes de qualquer rota
 *   2. Body parsing (express.json) — antes das rotas que leem req.body
 *   3. Rotas
 *   4. 404 handler — após todas as rotas
 *   5. Error handler — SEMPRE o último middleware (4 parâmetros)
 */

require('dotenv').config();

// Validar variáveis de ambiente obrigatórias na inicialização
// Falha rápido com mensagem clara em vez de erros crípticos em runtime
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
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3001;

// Helmet configura cabeçalhos HTTP de segurança automaticamente:
// X-Frame-Options (anti-clickjacking), X-Content-Type-Options (anti-MIME sniff),
// Strict-Transport-Security (força HTTPS), Content-Security-Policy (anti-XSS), etc.
app.use(helmet({ contentSecurityPolicy: true }));

// CORS restrito ao frontend autorizado — nunca '*' em produção
// credentials: true é obrigatório para que o browser envie cookies cross-origin
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Parsear cookies antes das rotas (authMiddleware lê req.cookies.token)
app.use(cookieParser());

// Parsear JSON no body — limit reduz superfície de ataque de payloads gigantes
app.use(express.json({ limit: '10kb' }));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/admin', adminRoutes);

// Health check — útil para monitoramento e deploy checks
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handler para rotas não encontradas — deve vir APÓS todas as rotas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error middleware — DEVE ser o último middleware registrado
// Express identifica handlers de erro pela assinatura de 4 parâmetros
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`[server] Élite Moda API rodando em http://localhost:${PORT}`);
  console.log(`[server] Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
