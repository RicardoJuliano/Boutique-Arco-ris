import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductImage from '../components/ProductImage';
import { getProduct, getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { useStagger } from '../hooks/useStagger';
import { useRecentlyViewed, getRecentlyViewed } from '../hooks/useRecentlyViewed';
import { getComplements } from '../utils/complementMap';
import { formatPrice } from '../utils/format';
import { CATEGORY_LABEL } from '../utils/categories';
import type { Product } from '../types';

function MiniCard({ product }: { product: Product }) {
  return (
    <Link to={`/produto/${product.id}`} className="group stagger-item block">
      <div className="relative aspect-[3/4] bg-surface2 overflow-hidden mb-3">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          fallbackLetter={product.name.charAt(0)}
          className="transition-transform duration-700 group-hover:scale-105"
        />
        {product.tag && (
          <span className="absolute top-2 left-2 text-[10px] font-body tracking-widest uppercase bg-bg border border-gold/40 text-gold px-2 py-0.5">
            {product.tag}
          </span>
        )}
        <div className="card-overlay absolute inset-x-0 bottom-0 bg-cream/90 backdrop-blur-sm px-3 py-2.5">
          <p className="font-body text-xs font-light text-surface leading-relaxed line-clamp-2">{product.desc}</p>
        </div>
      </div>
      <p className="font-display text-sm font-light text-cream leading-snug line-clamp-2">{product.name}</p>
      <p className="font-body text-xs font-light text-gold mt-0.5">{formatPrice(product.price)}</p>
    </Link>
  );
}

function ProductSection({ title, eyebrow, products }: { title: string; eyebrow: string; products: Product[] }) {
  const ref = useStagger([products]);
  if (!products.length) return null;
  return (
    <section className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="mb-8 md:mb-10">
          <p className="page-eyebrow">{eyebrow}</p>
          <h2 className="font-display text-2xl md:text-3xl font-light text-cream">{title}</h2>
        </div>
        <div ref={ref as React.RefObject<HTMLDivElement>} className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
          {products.map((p) => <MiniCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}

export default function ProdutoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct]   = useState<Product | null>(null);
  const [allProducts, setAll]   = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [selectedSize, setSize] = useState<import('../types').ProductSize | ''>('');
  const [added, setAdded]       = useState(false);

  useRecentlyViewed(product);

  useEffect(() => {
    setLoading(true);
    setSize('');

    Promise.all([getProduct(id!), getProducts()])
      .then(([{ product: p }, { products: all }]) => {
        setProduct(p);
        setAll(all);
        setSize(p.sizes?.[0] || '');
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Erro'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-bg">
          <div className="max-w-6xl mx-auto px-6 py-10 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
              <div className="aspect-[3/4] skeleton" />
              <div className="space-y-4 pt-4">
                <div className="skeleton h-3 w-24" />
                <div className="skeleton h-8 w-3/4" />
                <div className="skeleton h-6 w-20" />
                <div className="skeleton h-4 w-full mt-4" />
                <div className="skeleton h-4 w-5/6" />
                <div className="flex gap-2 mt-6">
                  {[1,2,3,4].map(i => <div key={i} className="skeleton h-10 w-14" />)}
                </div>
                <div className="skeleton h-12 w-full mt-4" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
          <p className="font-body text-sm font-light text-muted">{error || 'Produto não encontrado'}</p>
          <button onClick={() => navigate('/catalogo')} className="btn-gold px-6 py-2.5">Ver Catálogo</button>
        </div>
      </>
    );
  }

  const complements   = getComplements(product.category, allProducts, product.id);
  const recentlyViewed = getRecentlyViewed(product.id)
    .map((rv) => allProducts.find((p) => p.id === rv.id) || rv)
    .filter(Boolean)
    .slice(0, 5);

  function handleAdd() {
    if (!selectedSize || !product) return;
    addItem(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 pt-6 pb-0">
        <nav className="flex items-center gap-2 font-body text-xs font-light text-muted tracking-widest uppercase">
          <Link to="/" className="hover:text-gold transition-colors">Início</Link>
          <span>/</span>
          <Link to="/catalogo" className="hover:text-gold transition-colors">Catálogo</Link>
          <span>/</span>
          <span className="text-cream">{product.name}</span>
        </nav>
      </div>

      <section className="max-w-6xl mx-auto px-6 py-8 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">

          <div className="md:sticky md:top-24">
            <div className="relative aspect-[3/4] bg-surface2 overflow-hidden">
              <ProductImage
                src={product.image_url}
                alt={product.name}
                fallbackLetter={product.name.charAt(0)}
              />
              {product.tag && (
                <span className="absolute top-4 left-4 text-xs font-body font-light tracking-widest uppercase bg-bg border border-gold/40 text-gold px-3 py-1">
                  {product.tag}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="font-body text-xs font-light tracking-widest uppercase text-gold mb-2">
                {CATEGORY_LABEL[product.category] || product.category}
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-light text-cream leading-tight">
                {product.name}
              </h1>
              <p className="font-display text-2xl font-light text-gold mt-3">
                {formatPrice(product.price)}
              </p>
            </div>

            <p className="font-body text-sm font-light text-muted leading-relaxed border-t border-border pt-5">
              {product.desc}
            </p>

            <div className="space-y-3 border-t border-border pt-5">
              {product.colors?.length > 0 && (
                <div>
                  <p className="font-body text-xs font-light tracking-widest uppercase text-muted mb-2">Cores</p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.colors.map((c) => (
                      <span key={c} className="badge capitalize">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {product.style?.length > 0 && (
                <div>
                  <p className="font-body text-xs font-light tracking-widest uppercase text-muted mb-2">Estilo</p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.style.map((s) => (
                      <span key={s} className="badge capitalize">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {product.occasions?.length > 0 && (
                <div>
                  <p className="font-body text-xs font-light tracking-widest uppercase text-muted mb-2">Ocasiões</p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.occasions.map((o) => (
                      <span key={o} className="badge capitalize">{o}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-body text-xs font-light tracking-widest uppercase text-muted">
                  Tamanho
                </p>
                {selectedSize && (
                  <span className="font-body text-xs font-light text-gold tracking-widest uppercase">
                    Selecionado: {selectedSize}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes?.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-[44px] px-3 py-2 font-body text-sm font-light border transition-all duration-200
                      ${selectedSize === s
                        ? 'border-gold bg-gold text-bg'
                        : 'border-border text-muted hover:border-gold hover:text-cream'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t border-border pt-5">
              <button
                onClick={handleAdd}
                disabled={!selectedSize}
                className={`w-full py-4 font-body text-xs tracking-widest uppercase border transition-all duration-300
                  ${added
                    ? 'border-gold bg-gold text-bg'
                    : selectedSize
                      ? 'border-gold text-gold hover:bg-gold hover:text-bg'
                      : 'border-border text-muted cursor-not-allowed opacity-50'
                  }`}
              >
                {added ? '✓ Adicionado ao Carrinho' : selectedSize ? 'Adicionar ao Carrinho' : 'Selecione um Tamanho'}
              </button>
              {added && (
                <Link to="/carrinho" className="block text-center font-body text-xs tracking-widest uppercase text-gold hover:text-cream transition-colors">
                  Ver Carrinho →
                </Link>
              )}
              <Link to="/catalogo" className="block text-center font-body text-xs font-light tracking-widest uppercase text-muted hover:text-gold transition-colors">
                ← Voltar ao Catálogo
              </Link>
            </div>

            {product.stock <= 5 && product.stock > 0 && (
              <p className="font-body text-xs font-light text-gold/80 tracking-wide border border-gold/20 bg-gold/5 px-4 py-2.5">
                Apenas {product.stock} {product.stock === 1 ? 'unidade' : 'unidades'} em estoque
              </p>
            )}
          </div>
        </div>
      </section>

      <ProductSection
        eyebrow="Monte seu visual"
        title="Complete o Look"
        products={complements}
      />

      <ProductSection
        eyebrow="Sua navegação"
        title="Vistos Recentemente"
        products={recentlyViewed}
      />

      <Footer />
    </div>
  );
}
