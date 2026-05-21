const orderService   = require('../services/orderService');
const orderRepository = require('../repositories/orderRepository');

exports.create = async function create(req, res, next) {
  try {
    const result = await orderService.createOrder(req.user.id, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.list = function list(req, res, next) {
  try {
    const orders = orderRepository.findByUser(req.user.id);
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

exports.getById = function getById(req, res, next) {
  try {
    const order = orderRepository.findById(Number(req.params.id), req.user.id);
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
};
