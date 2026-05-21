const { z } = require('zod');
const db = require('../config/database');
const orderRepository = require('../repositories/orderRepository');

const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.number().int().positive(),
    size:      z.string().min(1).max(20),
    quantity:  z.number().int().min(1).max(10),
  })).min(1),
  address: z.object({
    name:       z.string().min(2).max(200),
    street:     z.string().min(5).max(300),
    city:       z.string().min(2).max(100),
    state:      z.string().min(2).max(2),
    zip:        z.string().regex(/^\d{5}-?\d{3}$/),
    phone:      z.string().min(10).max(20),
    district:   z.string().max(100).optional(),
    complement: z.string().max(200).optional(),
  }),
  shippingMethod: z.enum(['pac', 'sedex']),
  paymentMethod:  z.enum(['card', 'pix']),
  // shippingFee vindo do frontend após cálculo real pelo /api/freight
  shippingFee: z.number().positive().max(500),
});

exports.createOrder = function createOrder(userId, body) {
  const data = orderSchema.parse(body);

  // Toda a operação em transação atômica: verificar estoque, decrementar e criar pedido
  // sem possibilidade de race condition entre duas requisições simultâneas
  const result = db.transaction(() => {
    let subtotal = 0;
    const enriched = [];

    for (const item of data.items) {
      // Busca produto E verifica estoque em lock implícito da transação
      const product = db.prepare(
        'SELECT id, name, price, stock, active FROM products WHERE id = ?'
      ).get(item.productId);

      if (!product || !product.active) {
        throw Object.assign(new Error(`Produto ${item.productId} não encontrado`), { status: 422 });
      }
      if (product.stock < item.quantity) {
        throw Object.assign(new Error(`Estoque insuficiente para "${product.name}"`), { status: 422 });
      }

      // Decrementa estoque com guard — se outra transação concurrent decrementou,
      // o changes === 0 garante que não vendemos o que não temos
      const { changes } = db.prepare(
        'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?'
      ).run(item.quantity, product.id, item.quantity);
      if (changes === 0) {
        throw Object.assign(new Error(`Estoque insuficiente para "${product.name}"`), { status: 422 });
      }

      subtotal += product.price * item.quantity;
      enriched.push({ ...item, unitPrice: product.price });
    }

    const total = subtotal + data.shippingFee;
    const orderId = orderRepository.create({
      userId,
      total,
      shippingFee: data.shippingFee,
      address: data.address,
      shippingMethod: data.shippingMethod,
      paymentMethod:  data.paymentMethod,
    });

    for (const item of enriched) {
      orderRepository.addItem({
        orderId,
        productId: item.productId,
        size:      item.size,
        quantity:  item.quantity,
        unitPrice: item.unitPrice,
      });
    }

    return { orderId, total, shippingFee: data.shippingFee, status: 'processing' };
  })();

  return result;
};
