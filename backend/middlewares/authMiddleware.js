const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

module.exports = async function authMiddleware(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = userRepository.findById(payload.id);

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      cpf: user.cpf ?? null,
      isAdmin: user.is_admin === 1,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};
