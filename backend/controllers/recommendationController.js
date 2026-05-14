/**
 * controllers/recommendationController.js
 * Orquestra as requisições de recomendação: valida input, chama service, responde.
 * req.user é populado pelo authMiddleware antes de chegar aqui.
 */

const recommendationService = require('../services/recommendationService');
const recommendationRepository = require('../repositories/recommendationRepository');
const { quizSchema } = require('../validators/quizValidator');

// Gerar novas recomendações com base nas respostas do quiz
exports.create = async function create(req, res, next) {
  try {
    // Validar as respostas do quiz com Zod (enums estritos — anti prompt injection)
    const answers = quizSchema.parse(req.body.answers);

    const result = await recommendationService.getRecommendations({
      userId: req.user.id,
      answers,
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

// Retornar histórico de recomendações do usuário autenticado
exports.history = function history(req, res, next) {
  try {
    const records = recommendationRepository.findByUser(req.user.id);
    res.json({ history: records });
  } catch (err) {
    next(err);
  }
};
