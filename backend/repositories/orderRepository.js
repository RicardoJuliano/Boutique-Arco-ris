const db = require('../config/database');

exports.create = function create({ userId, total, shippingFee, address, shippingMethod, paymentMethod }) {
  const result = db.prepare(`
    INSERT INTO orders (user_id, total, shipping_fee, address, shipping_method, payment_method)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, total, shippingFee, JSON.stringify(address), shippingMethod, paymentMethod);
  return Number(result.lastInsertRowid);
};

exports.addItem = function addItem({ orderId, productId, size, quantity, unitPrice }) {
  db.prepare(`
    INSERT INTO order_items (order_id, product_id, size, quantity, unit_price)
    VALUES (?, ?, ?, ?, ?)
  `).run(orderId, productId, size, quantity, unitPrice);
};

exports.findById = function findById(id, userId) {
  const order = db.prepare(`
    SELECT o.*, u.name as user_name
    FROM orders o JOIN users u ON u.id = o.user_id
    WHERE o.id = ? AND o.user_id = ?
  `).get(id, userId);
  if (!order) return null;
  order.address = JSON.parse(order.address);
  order.items = db.prepare(`
    SELECT oi.*, p.name as product_name, p.image_url
    FROM order_items oi JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `).all(id);
  return order;
};

exports.findByUser = function findByUser(userId) {
  const orders = db.prepare(`
    SELECT id, status, total, shipping_fee, shipping_method, payment_method, created_at
    FROM orders WHERE user_id = ? ORDER BY created_at DESC
  `).all(userId);
  return orders.map(o => ({ ...o, address: JSON.parse(o.address || '{}') }));
};
