const authService = require('../services/authService');
const { registerSchema, loginSchema } = require('../validators/authValidator');

const isProd = process.env.NODE_ENV === 'production';

// cross-origin em produção (Vercel → Render) exige sameSite=none + secure
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

exports.register = async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);
    const { user, token } = await authService.register(data);
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

exports.login = async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);
    const { user, token } = await authService.login(data);
    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.logout = function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'strict',
  });
  res.json({ message: 'Logout realizado com sucesso' });
};

exports.me = function me(req, res) {
  res.json({ user: req.user });
};
