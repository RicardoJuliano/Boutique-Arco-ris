module.exports = function csrfMiddleware(req, res, next) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) return next();

  const origin = req.headers['origin'] || req.headers['referer'];
  const allowed = process.env.FRONTEND_URL;

  if (!origin || !origin.startsWith(allowed)) {
    return res.status(403).json({ error: 'Requisição bloqueada: origin inválida' });
  }

  next();
};
