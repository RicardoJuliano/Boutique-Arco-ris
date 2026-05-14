/**
 * middlewares/csrfMiddleware.js
 * Proteção CSRF via validação do header Origin/Referer.
 *
 * Por que não usar o pacote `csurf`?
 *   O pacote csurf foi deprecado e arquivado em março de 2023.
 *   Esta abordagem moderna combina duas camadas complementares:
 *   1. Cookie SameSite=Strict: o browser automaticamente não envia o cookie
 *      em requisições cross-site (ex: um site malicioso tentando chamar nossa API)
 *   2. Validação de Origin: esta função verifica explicitamente que a requisição
 *      veio do frontend autorizado — segunda barreira caso SameSite falhe
 *      em browsers antigos ou em proxies que removem o atributo
 */

module.exports = function csrfMiddleware(req, res, next) {
  // Métodos idempotentes não modificam estado — não precisam de proteção CSRF
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) return next();

  const origin = req.headers['origin'] || req.headers['referer'];
  const allowed = process.env.FRONTEND_URL;

  if (!origin || !origin.startsWith(allowed)) {
    return res.status(403).json({ error: 'Requisição bloqueada: origin inválida' });
  }

  next();
};
