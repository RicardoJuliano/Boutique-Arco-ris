const crypto = require('crypto');

const isProd = process.env.NODE_ENV === 'production';

const CSRF_COOKIE_OPTIONS = {
  httpOnly: false,
  secure: isProd,
  sameSite: isProd ? 'none' : 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function createCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

function setCsrfCookie(res) {
  const token = createCsrfToken();
  res.cookie('csrfToken', token, CSRF_COOKIE_OPTIONS);
  return token;
}

function clearCsrfCookie(res) {
  res.clearCookie('csrfToken', {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? 'none' : 'strict',
  });
}

function csrfMiddleware(req, res, next) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) return next();

  const originHeader = req.headers.origin || req.headers.referer;
  const allowed = process.env.FRONTEND_URL;

  let originOk = false;
  try {
    if (originHeader && allowed) {
      originOk = new URL(originHeader).origin === new URL(allowed).origin;
    }
  } catch {
    originOk = false;
  }

  if (!originOk) {
    return res.status(403).json({ error: 'Requisicao bloqueada: origin invalida' });
  }

  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'Requisicao bloqueada: token CSRF invalido' });
  }

  next();
}

module.exports = csrfMiddleware;
module.exports.setCsrfCookie = setCsrfCookie;
module.exports.clearCsrfCookie = clearCsrfCookie;
