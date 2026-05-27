const { ZodError } = require('zod');

// eslint-disable-next-line no-unused-vars
module.exports = function errorMiddleware(err, req, res, next) {
  const isDev = process.env.NODE_ENV === 'development';

  console.error({
    timestamp: new Date().toISOString(),
    method:    req.method,
    path:      req.path,
    error:     err.message,
    stack:     isDev ? err.stack : undefined,
  });

  if (err instanceof ZodError) {
    return res.status(400).json({
      error:   'Dados inválidos',
      details: err.flatten().fieldErrors,
    });
  }

  const status = err.status || 500;
  const message = isDev || status < 500
    ? err.message
    : 'Erro interno. Tente novamente mais tarde.';

  res.status(status).json({ error: message });
};
