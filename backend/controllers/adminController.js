const { z } = require('zod');
const productRepository = require('../repositories/productRepository');
const cloudinary = require('../config/cloudinary');

const parseField = (v) => { try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return v; } };

const VALID_CATEGORIES = ['vestido', 'camiseta', 'calça', 'conjunto', 'jaqueta'];
const VALID_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG', '34', '36', '38', '40', '42', '44', '46', 'U'];

const productSchema = z.object({
  name:        z.string().min(1).max(200),
  price:       z.number().positive().max(50000),
  category:    z.enum(VALID_CATEGORIES),
  stock:       z.number().int().min(0).max(9999),
  description: z.string().max(2000).optional().default(''),
  tag:         z.string().max(50).optional().nullable(),
  // imageUrl deve ser URL https ou string vazia — nunca javascript:
  imageUrl:    z.string().url().startsWith('https://').max(500).optional().or(z.literal('')),
  barcode:     z.string().max(100).optional().nullable(),
  active:      z.boolean().optional(),
  style:       z.array(z.string().max(50)).max(20).optional().default([]),
  colors:      z.array(z.string().max(50)).max(20).optional().default([]),
  occasions:   z.array(z.string().max(50)).max(20).optional().default([]),
  sizes:       z.array(z.enum(VALID_SIZES)).min(1).max(14),
});

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
    const body = {
      ...req.body,
      price:     Number(req.body.price),
      stock:     Number(req.body.stock) || 0,
      style:     parseField(req.body.style),
      colors:    parseField(req.body.colors),
      occasions: parseField(req.body.occasions),
      sizes:     parseField(req.body.sizes),
    };

    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
    }

    const product = productRepository.create({ ...parsed.data, tag: parsed.data.tag || null });
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = function updateProduct(req, res, next) {
  try {
    const id = Number(req.params.id);
    const body = { ...req.body };
    if (body.price     !== undefined) body.price = Number(body.price);
    if (body.stock     !== undefined) body.stock = Number(body.stock);
    if (body.style)     body.style     = parseField(body.style);
    if (body.colors)    body.colors    = parseField(body.colors);
    if (body.occasions) body.occasions = parseField(body.occasions);
    if (body.sizes)     body.sizes     = parseField(body.sizes);

    // Valida apenas os campos enviados (partial update)
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
    }

    const product = productRepository.update(id, parsed.data);
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

async function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'boutique-arco-iris', transformation: [{ width: 800, crop: 'limit' }] },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

exports.uploadImage = async function uploadImage(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada' });

    const result = await uploadToCloudinary(req.file.buffer);

    if (req.body.productId) {
      productRepository.update(Number(req.body.productId), { imageUrl: result.secure_url });
    }

    res.json({ url: result.secure_url });
  } catch (err) {
    next(err);
  }
};

exports.uploadExtraImage = async function uploadExtraImage(req, res, next) {
  try {
    const productId = Number(req.params.id);
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada' });

    const product = productRepository.findById(productId);
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

    if ((product.images?.length ?? 0) >= 4) {
      return res.status(400).json({ error: 'Máximo de 4 fotos adicionais atingido' });
    }

    const result = await uploadToCloudinary(req.file.buffer);
    const image = productRepository.addImage(productId, result.secure_url);
    res.status(201).json({ image });
  } catch (err) {
    next(err);
  }
};

exports.deleteExtraImage = function deleteExtraImage(req, res, next) {
  try {
    productRepository.removeImage(Number(req.params.imageId), Number(req.params.id));
    res.json({ message: 'Imagem removida' });
  } catch (err) {
    next(err);
  }
};
