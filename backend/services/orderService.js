const { z } = require('zod');
const pool = require('../config/database');
const orderRepository = require('../repositories/orderRepository');
const { getFreightQuote } = require('./freightService');

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
  paymentMethod:  z.enum(['pix']),
  shippingFee:    z.number().positive().max(500).optional(),
});

exports.createOrder = async function createOrder(userId, body) {
  const data = orderSchema.parse(body);

  const itemCount = data.items.reduce((sum, item) => sum + item.quantity, 0);
  const freightQuote = await getFreightQuote(data.address.zip, itemCount);
  const selectedShipping = freightQuote.shipping[data.shippingMethod];
  if (!selectedShipping) {
    throw Object.assign(new Error('Método de frete inválido'), { status: 422 });
  }
  const shippingFee = selectedShipping.price;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let subtotal = 0;
    const enrichedItems = [];

    for (const item of data.items) {
      const { rows } = await client.query(
        'SELECT id, name, price, stock, active FROM products WHERE id = $1',
        [item.productId]
      );
      const product = rows[0];

      if (!product || !product.active) {
        throw Object.assign(new Error(`Produto ${item.productId} não encontrado`), { status: 422 });
      }
      if (product.stock < item.quantity) {
        throw Object.assign(new Error(`Estoque insuficiente para "${product.name}"`), { status: 422 });
      }

      // guard de concorrência: só decrementa se o estoque ainda for suficiente no momento do UPDATE
      const { rowCount } = await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1',
        [item.quantity, product.id]
      );
      if (rowCount === 0) {
        throw Object.assign(new Error(`Estoque insuficiente para "${product.name}"`), { status: 422 });
      }

      subtotal += product.price * item.quantity;
      enrichedItems.push({ ...item, unitPrice: product.price, productName: product.name });
    }

    const total = subtotal + shippingFee;
    const orderId = await orderRepository.create({
      userId,
      total,
      shippingFee,
      address:        data.address,
      shippingMethod: data.shippingMethod,
      paymentMethod:  data.paymentMethod,
    }, client);

    for (const item of enrichedItems) {
      await orderRepository.addItem({
        orderId,
        productId: item.productId,
        size:      item.size,
        quantity:  item.quantity,
        unitPrice: item.unitPrice,
      }, client);
    }

    await client.query('COMMIT');
    return {
      orderId,
      total,
      shippingFee,
      status:         'processing',
      items:          enrichedItems,
      address:        data.address,
      shippingMethod: data.shippingMethod,
      paymentMethod:  data.paymentMethod,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
