const recommendationService = require('../services/recommendationService');
const recommendationRepository = require('../repositories/recommendationRepository');
const { quizSchema } = require('../validators/quizValidator');

exports.create = async function create(req, res, next) {
  try {
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

exports.history = async function history(req, res, next) {
  try {
    const records = await recommendationRepository.findByUser(req.user.id);
    res.json({ history: records });
  } catch (err) {
    next(err);
  }
};
