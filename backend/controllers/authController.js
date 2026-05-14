/**
 * controllers/authController.js
 * Orquestra o fluxo de autenticação: valida input, chama service, seta cookie, responde.
 * O controller não contém regras de negócio — apenas coordena.
 * Se uma função lançar erro, o Express repassa automaticamente ao errorMiddleware
 * por causa do wrapper asyncHandler abaixo.
 */

const authService = require('../services/authService');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const userRepository = require('../repositories/userRepository');

// Configuração do cookie JWT — centralizada aqui para garantir consistência
// entre login e registro (ambos definem o mesmo cookie)
const COOKIE_OPTIONS = {
  httpOnly: true,    // JS no browser não acessa — elimina XSS como vetor de roubo
  secure: process.env.NODE_ENV === 'production',  // HTTPS apenas em produção
  sameSite: 'strict', // Bloqueia envio cross-site (proteção CSRF primária)
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias em milissegundos
};

exports.register = async function register(req, res, next) {
  try {
    // parse() lança ZodError se inválido — capturado pelo errorMiddleware
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
  // Limpar o cookie definindo maxAge=0
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: 'Logout realizado com sucesso' });
};

// Retorna os dados do usuário autenticado — útil para o frontend restaurar
// o estado de auth após um reload da página (sem precisar fazer login novamente)
exports.me = function me(req, res) {
  // req.user foi populado pelo authMiddleware
  res.json({ user: req.user });
};
