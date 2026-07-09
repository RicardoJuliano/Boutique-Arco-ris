const pool = require('../config/database');

async function fetchImages(productIds) {
  if (!productIds.length) return {};
  const placeholders = productIds.map((_, i) => `$${i + 1}`).join(',');
  const { rows } = await pool.query(
    `SELECT id, product_id, url, position FROM product_images WHERE product_id IN (${placeholders}) ORDER BY product_id, position`,
    productIds
  );
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
    id:        row.id,
    name:      row.name,
    price:     row.price,
    category:  row.category,
    style:     JSON.parse(row.style),
    colors:    JSON.parse(row.colors),
    occasions: JSON.parse(row.occasions),
    sizes:     JSON.parse(row.sizes),
    desc:      row.description,
    tag:       row.tag,
    image_url: row.image_url,
    barcode:   row.barcode || null,
    stock:     row.stock,
    active:    Boolean(row.active),
    images,
  };
}

exports.findAll = async function findAll() {
  const { rows } = await pool.query('SELECT * FROM products ORDER BY id');
  const imageMap = await fetchImages(rows.map((r) => r.id));
  return rows.map((row) => parse(row, imageMap[row.id] || []));
};

exports.findActive = async function findActive() {
  const { rows } = await pool.query('SELECT * FROM products WHERE active = true ORDER BY id');
  const imageMap = await fetchImages(rows.map((r) => r.id));
  return rows.map((row) => parse(row, imageMap[row.id] || []));
};

exports.findById = async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  const row = rows[0];
  if (!row) return null;
  const imageMap = await fetchImages([id]);
  return parse(row, imageMap[id] || []);
};

exports.create = async function create({ name, price, category, style, colors, occasions, sizes, description, tag, imageUrl, barcode, stock }) {
  const { rows } = await pool.query(
    `INSERT INTO products (name, price, category, style, colors, occasions, sizes, description, tag, image_url, barcode, stock)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
    [name, price, category, JSON.stringify(style), JSON.stringify(colors), JSON.stringify(occasions), JSON.stringify(sizes),
     description || '', tag || null, imageUrl || null, barcode || null, stock || 0]
  );
  return exports.findById(rows[0].id);
};

exports.update = async function update(id, fields) {
  const { rows: cur } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  const current = cur[0];
  if (!current) return null;

  const updated = {
    name:        fields.name        ?? current.name,
    price:       fields.price       ?? current.price,
    category:    fields.category    ?? current.category,
    style:       fields.style       ? JSON.stringify(fields.style)     : current.style,
    colors:      fields.colors      ? JSON.stringify(fields.colors)    : current.colors,
    occasions:   fields.occasions   ? JSON.stringify(fields.occasions) : current.occasions,
    sizes:       fields.sizes       ? JSON.stringify(fields.sizes)     : current.sizes,
    description: fields.description ?? current.description,
    tag:         fields.tag         !== undefined ? fields.tag                    : current.tag,
    image_url:   fields.imageUrl    !== undefined ? fields.imageUrl               : current.image_url,
    barcode:     fields.barcode     !== undefined ? (fields.barcode || null)      : current.barcode,
    stock:       fields.stock       !== undefined ? fields.stock                  : current.stock,
    active:      fields.active      !== undefined ? Boolean(fields.active)        : current.active,
  };

  await pool.query(
    `UPDATE products SET name=$1, price=$2, category=$3, style=$4, colors=$5, occasions=$6, sizes=$7,
     description=$8, tag=$9, image_url=$10, barcode=$11, stock=$12, active=$13, updated_at=NOW() WHERE id=$14`,
    [updated.name, updated.price, updated.category, updated.style, updated.colors, updated.occasions, updated.sizes,
     updated.description, updated.tag, updated.image_url, updated.barcode, updated.stock, updated.active, id]
  );

  return exports.findById(id);
};

exports.remove = async function remove(id) {
  await pool.query('DELETE FROM products WHERE id = $1', [id]);
};

exports.addImage = async function addImage(productId, url) {
  const { rows } = await pool.query('SELECT COUNT(*) AS cnt FROM product_images WHERE product_id = $1', [productId]);
  const position = Number(rows[0].cnt);
  const result = await pool.query(
    'INSERT INTO product_images (product_id, url, position) VALUES ($1, $2, $3) RETURNING id',
    [productId, url, position]
  );
  return { id: result.rows[0].id, url, position };
};

exports.removeImage = async function removeImage(imageId, productId) {
  await pool.query('DELETE FROM product_images WHERE id = $1 AND product_id = $2', [imageId, productId]);
};
