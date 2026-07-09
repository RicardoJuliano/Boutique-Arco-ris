const pool = require('../config/database');

exports.create = async function create({ userId, total, shippingFee, address, shippingMethod, paymentMethod }, client) {
  const q = client || pool;
  const { rows } = await q.query(
    `INSERT INTO orders (user_id, total, shipping_fee, address, shipping_method, payment_method)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [userId, total, shippingFee, JSON.stringify(address), shippingMethod, paymentMethod]
  );
  return rows[0].id;
};

exports.addItem = async function addItem({ orderId, productId, size, quantity, unitPrice }, client) {
  const q = client || pool;
  await q.query(
    'INSERT INTO order_items (order_id, product_id, size, quantity, unit_price) VALUES ($1, $2, $3, $4, $5)',
    [orderId, productId, size, quantity, unitPrice]
  );
};

exports.findById = async function findById(id, userId) {
  const { rows: orderRows } = await pool.query(
    `SELECT o.*, u.name as user_name
     FROM orders o JOIN users u ON u.id = o.user_id
     WHERE o.id = $1 AND o.user_id = $2`,
    [id, userId]
  );
  const order = orderRows[0];
  if (!order) return null;

  order.address = JSON.parse(order.address);

  const { rows: items } = await pool.query(
    `SELECT oi.*, p.name as product_name, p.image_url
     FROM order_items oi JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1`,
    [id]
  );
  order.items = items;
  return order;
};

exports.findByUser = async function findByUser(userId) {
  const { rows } = await pool.query(
    `SELECT id, status, total, shipping_fee, shipping_method, payment_method, address, created_at
     FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows.map((o) => ({ ...o, address: JSON.parse(o.address || '{}') }));
};
