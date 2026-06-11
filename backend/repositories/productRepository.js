const db = require('../config/database');

function fetchImages(productIds) {
  if (!productIds.length) return {};
  const placeholders = productIds.map(() => '?').join(',');
  const rows = db.prepare(
    `SELECT id, product_id, url, position FROM product_images WHERE product_id IN (${placeholders}) ORDER BY product_id, position`
  ).all(...productIds);
  const map = {};
  for (const row of rows) {
    if (!map[row.product_id]) map[row.product_id] = [];
    map[row.product_id].push({ id: row.id, url: row.url, position: row.position });
  }
  return map;
}

function parse(row, images = []) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    category: row.category,
    style: JSON.parse(row.style),
    colors: JSON.parse(row.colors),
    occasions: JSON.parse(row.occasions),
    sizes: JSON.parse(row.sizes),
    desc: row.description,
    tag: row.tag,
    image_url: row.image_url,
    barcode: row.barcode || null,
    stock: row.stock,
    active: row.active === 1,
    images,
  };
}

exports.findAll = function findAll() {
  const rows = db.prepare('SELECT * FROM products ORDER BY id').all();
  const imageMap = fetchImages(rows.map((r) => r.id));
  return rows.map((row) => parse(row, imageMap[row.id] || []));
};

exports.findActive = function findActive() {
  const rows = db.prepare('SELECT * FROM products WHERE active = 1 ORDER BY id').all();
  const imageMap = fetchImages(rows.map((r) => r.id));
  return rows.map((row) => parse(row, imageMap[row.id] || []));
};

exports.findById = function findById(id) {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!row) return null;
  const imageMap = fetchImages([id]);
  return parse(row, imageMap[id] || []);
};

exports.create = function create({ name, price, category, style, colors, occasions, sizes, description, tag, imageUrl, barcode, stock }) {
  const result = db.prepare(`
    INSERT INTO products (name, price, category, style, colors, occasions, sizes, description, tag, image_url, barcode, stock)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, price, category, JSON.stringify(style), JSON.stringify(colors), JSON.stringify(occasions), JSON.stringify(sizes), description || '', tag || null, imageUrl || null, barcode || null, stock || 0);
  return exports.findById(Number(result.lastInsertRowid));
};

exports.update = function update(id, fields) {
  const current = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!current) return null;

  const updated = {
    name: fields.name ?? current.name,
    price: fields.price ?? current.price,
    category: fields.category ?? current.category,
    style: fields.style ? JSON.stringify(fields.style) : current.style,
    colors: fields.colors ? JSON.stringify(fields.colors) : current.colors,
    occasions: fields.occasions ? JSON.stringify(fields.occasions) : current.occasions,
    sizes: fields.sizes ? JSON.stringify(fields.sizes) : current.sizes,
    description: fields.description ?? current.description,
    tag: fields.tag !== undefined ? fields.tag : current.tag,
    image_url: fields.imageUrl !== undefined ? fields.imageUrl : current.image_url,
    barcode: fields.barcode !== undefined ? (fields.barcode || null) : current.barcode,
    stock: fields.stock !== undefined ? fields.stock : current.stock,
    active: fields.active !== undefined ? (fields.active ? 1 : 0) : current.active,
  };

  db.prepare(`
    UPDATE products SET name=?, price=?, category=?, style=?, colors=?, occasions=?, sizes=?,
    description=?, tag=?, image_url=?, barcode=?, stock=?, active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
  `).run(updated.name, updated.price, updated.category, updated.style, updated.colors, updated.occasions, updated.sizes, updated.description, updated.tag, updated.image_url, updated.barcode, updated.stock, updated.active, id);

  return exports.findById(id);
};

exports.remove = function remove(id) {
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
};

exports.addImage = function addImage(productId, url) {
  const row = db.prepare('SELECT COUNT(*) as cnt FROM product_images WHERE product_id = ?').get(productId);
  const position = row.cnt;
  const result = db.prepare(
    'INSERT INTO product_images (product_id, url, position) VALUES (?, ?, ?)'
  ).run(productId, url, position);
  return { id: Number(result.lastInsertRowid), url, position };
};

exports.removeImage = function removeImage(imageId, productId) {
  db.prepare('DELETE FROM product_images WHERE id = ? AND product_id = ?').run(imageId, productId);
};
