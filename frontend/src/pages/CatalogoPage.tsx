import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductImage from '../components/ProductImage';
import { getProducts } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useStagger } from '../hooks/useStagger';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import { CATEGORIES } from '../utils/categories';
import type { Product } from '../types';

const FILTER_CATEGORIES = [{ value: 'todos', label: 'Todos' }, ...CATEGORIES];

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i}>
          <div className="aspect-[3/4] skeleton mb-4" />
          <div className="skeleton h-4 w-3/4 mb-2 rounded-sm" />
          <div className="skeleton h-3 w-1/3 rounded-sm" />
        </div>
      ))}
    </div>
  );
}

function ProductItem({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [added, setAdded] = useState(false);

  function handleAdd() {
    if (!selectedSize) return;
    addItem(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="group stagger-item">
      <Link to={`/produto/${product.id}`} className="block">
        <div className="relative aspect-[3/4] bg-surface2 overflow-hidden mb-4">
          <ProductImage
            src={product.image_url}
            alt={product.name}
            fallbackLetter={product.name.charAt(0)}
            className="transition-transform duration-700 group-hover:scale-105"
          />
          {product.tag && (
            <span className="absolute top-3 left-3 text-[10px] font-body font-light tracking-widest uppercase bg-bg border border-gold/40 text-gold px-2 py-0.5">
              {product.tag}
            </span>
          )}
          <div className="card-overlay absolute inset-x-0 bottom-0 bg-cream/90 backdrop-blur-sm px-4 py-3">
            <p className="font-body text-xs font-light text-surface leading-relaxed line-clamp-2">
              {product.desc}
            </p>
            {product.sizes?.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-2">
                {product.sizes.slice(0, 4).map((s) => (
                  <span key={s} className="text-[10px] font-body font-light text-surface/70 border border-surface/30 px-1.5 py-0.5">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>

      <div className="px-1">
        <Link to={`/produto/${product.id}`} className="block hover:text-gold transition-colors">
          <h3 className="font-display text-lg font-light text-cream leading-snug">{product.name}</h3>
        </Link>
        <p className="font-body text-sm font-light text-gold mt-1">{formatPrice(product.price)}</p>

        <div className="mt-4 space-y-2">
          {product.sizes?.length > 1 && (
            <div className="flex gap-1.5 flex-wrap">
              {product.sizes.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`text-xs font-body px-2.5 py-1 border transition-colors
                    ${selectedSize === s ? 'border-gold bg-gold/10 text-gold' : 'border-border text-muted hover:border-gold/50'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={handleAdd}
            disabled={!selectedSize}
            className={`w-full py-2.5 font-body text-xs tracking-widest uppercase border transition-all
              ${added ? 'border-gold bg-gold text-bg' : 'border-border text-muted hover:border-gold hover:text-cream'}`}
          >
            {added ? '✓ Adicionado' : 'Adicionar ao Carrinho'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CatalogoPage() {
  const { isAuthenticated } = useAuth();
  const [products, setProducts]             = useState<Product[]>([]);
  const [loading, setLoading]               = useState(true);
  const [activeCategory, setActiveCategory] = useState('todos');
  const [searchParams, setSearchParams]     = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const gridRef = useStagger([products, activeCategory, searchQuery]);

  useEffect(() => {
    getProducts()
      .then(({ products }) => setProducts(products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchQuery) setActiveCategory('todos');
  }, [searchQuery]);

  const filtered = products.filter((p) => {
    const matchesCategory = activeCategory === 'todos' || p.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      (p.desc && p.desc.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  function clearSearch() {
    setSearchParams({});
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-14 md:py-20 text-center">
          <p className="page-eyebrow">Nossa Coleção</p>
          <h1 className="font-display text-4xl md:text-6xl font-light text-cream">Catálogo</h1>
          <p className="font-body text-sm font-light text-muted mt-4 max-w-md mx-auto leading-relaxed">
            Peças selecionadas para cada estilo e ocasião. Use a consultora de IA para descobrir
            quais combinam com você.
          </p>
        </div>
      </section>

      <section className="border-b border-border bg-surface sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-6 overflow-x-auto py-4" style={{ scrollbarWidth: 'none' }}>
            {FILTER_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setActiveCategory(cat.value);
                  if (searchQuery) clearSearch();
                }}
                className={`relative font-body text-xs tracking-widest uppercase whitespace-nowrap pb-2 transition-colors duration-200
                  ${activeCategory === cat.value && !searchQuery ? 'text-gold' : 'text-muted hover:text-cream'}`}
              >
                {cat.label}
                <span
                  className={`absolute bottom-0 left-0 h-px bg-gold transition-all duration-300 ease-out
                    ${activeCategory === cat.value && !searchQuery ? 'w-full' : 'w-0'}`}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        {searchQuery && (
          <div className="flex items-center justify-between mb-8">
            <p className="font-body text-sm font-light text-muted">
              Resultados para <span className="text-cream">"{searchQuery}"</span>
            </p>
            <button
              onClick={clearSearch}
              className="font-body text-xs font-light text-muted hover:text-gold transition-colors tracking-widest uppercase"
            >
              Limpar busca ✕
            </button>
          </div>
        )}

        {loading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <p className="text-center font-body text-sm font-light text-muted py-24">
            {searchQuery
              ? `Nenhum produto encontrado para "${searchQuery}".`
              : 'Nenhum produto nesta categoria.'}
          </p>
        ) : (
          <>
            {!searchQuery && (
              <p className="font-body text-xs font-light text-muted tracking-widest uppercase mb-8">
                {filtered.length} {filtered.length === 1 ? 'peça' : 'peças'}
              </p>
            )}
            <div ref={gridRef as React.RefObject<HTMLDivElement>} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {filtered.map((product) => (
                <ProductItem key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 text-center">
          <p className="page-eyebrow">Consultora Pessoal</p>
          <h2 className="font-display text-3xl md:text-4xl font-light text-cream mb-4">
            Precisa de ajuda para escolher?
          </h2>
          <p className="font-body text-sm font-light text-muted max-w-md mx-auto mb-8 leading-relaxed">
            Nossa consultora de IA analisa seu estilo, ocasião e orçamento para selecionar
            as peças perfeitas para você.
          </p>
          {isAuthenticated ? (
            <Link to="/quiz" className="btn-gold-hero">Iniciar Consultoria</Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-gold-hero">Criar Conta Grátis</Link>
              <Link to="/login" className="btn-outline-hero">Já tenho conta</Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
