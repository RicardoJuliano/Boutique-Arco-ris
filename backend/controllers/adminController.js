const productRepository = require('../repositories/productRepository');
const cloudinary = require('../config/cloudinary');

exports.listProducts = function listProducts(req, res, next) {
  try {
    const products = productRepository.findAll();
    res.json({ products });
  } catch (err) {
    next(err);
  }
};

exports.getProduct = function getProduct(req, res, next) {
  try {
    const product = productRepository.findById(Number(req.params.id));
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = function createProduct(req, res, next) {
  try {
    const { name, price, category, style, colors, occasions, sizes, description, tag, stock } = req.body;
    const product = productRepository.create({
      name,
      price: Number(price),
      category,
      style: typeof style === 'string' ? JSON.parse(style) : style,
      colors: typeof colors === 'string' ? JSON.parse(colors) : colors,
      occasions: typeof occasions === 'string' ? JSON.parse(occasions) : occasions,
      sizes: typeof sizes === 'string' ? JSON.parse(sizes) : sizes,
      description,
      tag: tag || null,
      stock: Number(stock) || 0,
    });
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = function updateProduct(req, res, next) {
  try {
    const id = Number(req.params.id);
    const fields = { ...req.body };
    if (fields.price) fields.price = Number(fields.price);
    if (fields.stock !== undefined) fields.stock = Number(fields.stock);
    if (fields.style && typeof fields.style === 'string') fields.style = JSON.parse(fields.style);
    if (fields.colors && typeof fields.colors === 'string') fields.colors = JSON.parse(fields.colors);
    if (fields.occasions && typeof fields.occasions === 'string') fields.occasions = JSON.parse(fields.occasions);
    if (fields.sizes && typeof fields.sizes === 'string') fields.sizes = JSON.parse(fields.sizes);

    const product = productRepository.update(id, fields);
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = function deleteProduct(req, res, next) {
  try {
    productRepository.remove(Number(req.params.id));
    res.json({ message: 'Produto removido' });
  } catch (err) {
    next(err);
  }
};

exports.uploadImage = async function uploadImage(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada' });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'boutique-arco-iris', transformation: [{ width: 800, crop: 'limit' }] },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    // Se um id de produto foi fornecido, atualizar a imagem diretamente
    if (req.body.productId) {
      productRepository.update(Number(req.body.productId), { imageUrl: result.secure_url });
    }

    res.json({ url: result.secure_url });
  } catch (err) {
    next(err);
  }
};
