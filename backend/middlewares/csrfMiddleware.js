module.exports = function csrfMiddleware(req, res, next) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) return next();

  const originHeader = req.headers['origin'] || req.headers['referer'];
  const allowed = process.env.FRONTEND_URL;

  let originOk = false;
  try {
    if (originHeader) {
      originOk = new URL(originHeader).origin === new URL(allowed).origin;
    }
  } catch { /* URL malformada → bloqueada */ }

  if (!originOk) {
    return res.status(403).json({ error: 'Requisição bloqueada: origin inválida' });
  }

  next();
};
