const db = require('../config/database');

function parse(row) {
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
    stock: row.stock,
    active: row.active === 1,
  };
}

exports.findAll = function findAll() {
  return db.prepare('SELECT * FROM products ORDER BY id').all().map(parse);
};

exports.findActive = function findActive() {
  return db.prepare('SELECT * FROM products WHERE active = 1 ORDER BY id').all().map(parse);
};

exports.findById = function findById(id) {
  return parse(db.prepare('SELECT * FROM products WHERE id = ?').get(id));
};

exports.create = function create({ name, price, category, style, colors, occasions, sizes, description, tag, imageUrl, stock }) {
  const result = db.prepare(`
    INSERT INTO products (name, price, category, style, colors, occasions, sizes, description, tag, image_url, stock)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, price, category, JSON.stringify(style), JSON.stringify(colors), JSON.stringify(occasions), JSON.stringify(sizes), description || '', tag || null, imageUrl || null, stock || 0);
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
    stock: fields.stock !== undefined ? fields.stock : current.stock,
    active: fields.active !== undefined ? (fields.active ? 1 : 0) : current.active,
  };

  db.prepare(`
    UPDATE products SET name=?, price=?, category=?, style=?, colors=?, occasions=?, sizes=?,
    description=?, tag=?, image_url=?, stock=?, active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
  `).run(updated.name, updated.price, updated.category, updated.style, updated.colors, updated.occasions, updated.sizes, updated.description, updated.tag, updated.image_url, updated.stock, updated.active, id);

  return exports.findById(id);
};

exports.remove = function remove(id) {
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
};
