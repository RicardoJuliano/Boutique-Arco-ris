/**
 * middlewares/errorMiddleware.js
 * Handler global de erros — deve ser o ÚLTIMO middleware registrado no server.js.
 * Express identifica handlers de erro pela assinatura de 4 parâmetros (err, req, res, next).
 *
 * Por que centralizar aqui?
 *   - Garante que stack traces NUNCA sejam expostos ao cliente em produção
 *   - Log estruturado com timestamp e contexto da requisição facilita debugging
 *   - ZodError (validação) é tratado separadamente para retornar campos específicos
 */

const { ZodError } = require('zod');

// eslint-disable-next-line no-unused-vars
module.exports = function errorMiddleware(err, req, res, next) {
  const isDev = process.env.NODE_ENV === 'development';

  // Log estruturado — sempre logar, mesmo em produção (para monitoramento)
  console.error({
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    error: err.message,
    // stack apenas em dev para não poluir logs de produção com detalhes internos
    stack: isDev ? err.stack : undefined,
  });

  // ZodError: retornar erros de validação campo a campo para o frontend exibir
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.flatten().fieldErrors,
    });
  }

  // Erros lançados pelo service/repository com status HTTP explícito
  const status = err.status || 500;

  // Em produção, não revelar mensagens de erro internas ao cliente
  const message = isDev
    ? err.message
    : status < 500
    ? err.message  // erros 4xx são esperados — mostrar a mensagem
    : 'Erro interno. Tente novamente mais tarde.';

  res.status(status).json({ error: message });
};
