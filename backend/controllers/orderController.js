const orderService    = require('../services/orderService');
const orderRepository = require('../repositories/orderRepository');
const { sendOrderEmail } = require('../utils/mailer');

exports.create = async function create(req, res, next) {
  try {
    const result = await orderService.createOrder(req.user.id, req.body);

    // Responde ao cliente imediatamente — email é disparado sem bloquear
    res.status(201).json({
      orderId:     result.orderId,
      total:       result.total,
      shippingFee: result.shippingFee,
      status:      result.status,
    });

    sendOrderEmail(result, req.user).catch((err) =>
      console.error('[email] Falha ao enviar notificação de pedido:', err.message)
    );
  } catch (err) {
    next(err);
  }
};

exports.list = async function list(req, res, next) {
  try {
    const orders = await orderRepository.findByUser(req.user.id);
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

exports.getById = async function getById(req, res, next) {
  try {
    const order = await orderRepository.findById(Number(req.params.id), req.user.id);
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
};
