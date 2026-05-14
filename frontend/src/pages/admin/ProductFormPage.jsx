import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  adminGetProduct,
  adminCreateProduct,
  adminUpdateProduct,
  adminUploadImage,
} from '../../services/api';
import Navbar from '../../components/Navbar';

const CATEGORIES = ['Vestidos', 'Blusas', 'Calças', 'Saias', 'Acessórios', 'Outros'];

const ARRAY_FIELDS = [
  { key: 'style', label: 'Estilos' },
  { key: 'colors', label: 'Cores' },
  { key: 'occasions', label: 'Ocasiões' },
  { key: 'sizes', label: 'Tamanhos' },
];

const empty = {
  name: '',
  price: '',
  category: CATEGORIES[0],
  style: '',
  colors: '',
  occasions: '',
  sizes: '',
  description: '',
  tag: '',
  stock: '0',
  active: true,
};

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id) && id !== 'novo';
  const navigate = useNavigate();

  const [form, setForm] = useState(empty);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    if (!isEdit) return;
    adminGetProduct(id)
      .then(({ product }) => {
        setForm({
          name: product.name || '',
          price: String(product.price || ''),
          category: product.category || CATEGORIES[0],
          style: Array.isArray(product.style) ? product.style.join(', ') : '',
          colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
          occasions: Array.isArray(product.occasions) ? product.occasions.join(', ') : '',
          sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
          description: product.desc || '',
          tag: product.tag || '',
          stock: String(product.stock ?? 0),
          active: product.active !== false,
        });
        setImageUrl(product.image_url || '');
        setImagePreview(product.image_url || '');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function splitArray(str) {
    return str
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async function handleUpload() {
    if (!imageFile) return imageUrl;
    setUploading(true);
    try {
      const data = await adminUploadImage(imageFile, isEdit ? id : undefined);
      setImageUrl(data.url);
      setImageFile(null);
      return data.url;
    } catch (e) {
      throw new Error('Erro no upload: ' + e.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      let finalImageUrl = imageUrl;
      if (imageFile) finalImageUrl = await handleUpload();

      const payload = {
        name: form.name,
        price: Number(form.price),
        category: form.category,
        style: splitArray(form.style),
        colors: splitArray(form.colors),
        occasions: splitArray(form.occasions),
        sizes: splitArray(form.sizes),
        description: form.description,
        tag: form.tag || null,
        stock: Number(form.stock),
        active: form.active,
        imageUrl: finalImageUrl || undefined,
      };

      if (isEdit) {
        await adminUpdateProduct(id, payload);
      } else {
        await adminCreateProduct(payload);
      }

      navigate('/admin/produtos');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <p className="page-eyebrow">Painel Admin</p>
            <h1 className="page-title">{isEdit ? 'Editar Produto' : 'Novo Produto'}</h1>
          </div>

          {error && <p className="error-msg mb-6">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="field-label">Nome do produto</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="field-input"
                placeholder="Ex: Vestido Floral Rosa"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Preço (R$)</label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  required
                  className="field-input"
                  placeholder="89.90"
                />
              </div>
              <div>
                <label className="field-label">Estoque</label>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  required
                  className="field-input"
                  placeholder="10"
                />
              </div>
            </div>

            <div>
              <label className="field-label">Categoria</label>
              <select name="category" value={form.category} onChange={handleChange} className="field-input">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {ARRAY_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="field-label">{label} <span className="normal-case text-muted/60">(separe por vírgula)</span></label>
                <input
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  className="field-input"
                  placeholder={key === 'sizes' ? 'P, M, G, GG' : key === 'colors' ? 'Rosa, Branco, Preto' : ''}
                />
              </div>
            ))}

            <div>
              <label className="field-label">Descrição</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="field-input resize-none"
                placeholder="Breve descrição do produto..."
              />
            </div>

            <div>
              <label className="field-label">Tag <span className="normal-case text-muted/60">(ex: novo, promoção)</span></label>
              <input
                name="tag"
                value={form.tag}
                onChange={handleChange}
                className="field-input"
                placeholder="novo"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="accent-gold w-4 h-4"
              />
              <label htmlFor="active" className="field-label mb-0 cursor-pointer">Produto ativo (visível na loja)</label>
            </div>

            <div>
              <label className="field-label">Foto do produto</label>
              <div className="flex gap-4 items-start">
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover border border-border" />
                )}
                <div className="flex-1">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current.click()}
                    className="btn-gold btn-outline text-sm"
                  >
                    {imagePreview ? 'Trocar foto' : 'Escolher foto'}
                  </button>
                  {imageFile && (
                    <p className="mt-2 text-xs text-muted font-body">{imageFile.name}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving || uploading}
                className="btn-gold btn-gold-submit flex-1"
              >
                {saving || uploading ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar produto'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/produtos')}
                className="btn-gold btn-outline px-6 py-3"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
