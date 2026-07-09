const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = '7d';

// Hash fixo para garantir tempo de resposta constante e evitar timing attack
const DUMMY_HASH = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/sDMqbAm';

exports.register = async function register({ name, email, cpf, password }) {
  const existingEmail = await userRepository.findByEmail(email);
  if (existingEmail) {
    const err = new Error('Não foi possível criar a conta com esses dados');
    err.status = 409;
    throw err;
  }

  const existingCPF = await userRepository.findByCPF(cpf);
  if (existingCPF) {
    const err = new Error('CPF já cadastrado');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepository.create({ name, email, cpf, passwordHash, isAdmin: false });
  const token = generateToken(user);

  return { user: { ...user, isAdmin: false }, token };
};

exports.login = async function login({ email, password }) {
  const found = await userRepository.findByEmail(email);
  const hashToCompare = found ? found.password_hash : DUMMY_HASH;
  const match = await bcrypt.compare(password, hashToCompare);

  if (!found || !match) {
    const err = new Error('Email ou senha incorretos');
    err.status = 401;
    throw err;
  }

  const user = {
    id:      found.id,
    name:    found.name,
    email:   found.email,
    cpf:     found.cpf ?? null,
    isAdmin: Boolean(found.is_admin),
  };
  const token = generateToken(user);

  return { user, token };
};

function generateToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}
