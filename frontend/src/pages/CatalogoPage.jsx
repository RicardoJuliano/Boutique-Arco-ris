import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getProducts } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const CATEGORIES = [
  { key: 'todos', label: 'Todos' },
  { key: 'vestido', label: 'Vestidos & Saias' },
  { key: 'conjunto', label: 'Conjuntos' },
  { key: 'jaqueta', label: 'Jaquetas & Casacos' },
  { key: 'calça', label: 'Calças' },
  { key: 'camiseta', label: 'Blusas & Tops' },
];

function ProductItem({ product }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group">
      <div className="relative aspect-[3/4] bg-surface2 overflow-hidden mb-4">
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface2">
            <span className="font-display text-6xl font-light text-gold/20">
              {product.name.charAt(0)}
            </span>
          </div>
        )}
        {product.tag && (
          <span className="absolute top-3 left-3 text-[10px] font-body font-light tracking-widest uppercase bg-bg border border-gold/40 text-gold px-2 py-0.5">
            {product.tag}
          </span>
        )}
      </div>

      <div className="px-1">
        <h3 className="font-display text-lg font-light text-cream leading-snug">{product.name}</h3>
        <p className="font-body text-sm font-light text-gold mt-1">
          R$ {product.price.toFixed(2).replace('.', ',')}
        </p>
        <p className="font-body text-xs font-light text-muted mt-2 leading-relaxed line-clamp-2">
          {product.desc}
        </p>
        <div className="flex gap-1.5 flex-wrap mt-3">
          {product.sizes?.map((size) => (
            <span key={size} className="badge">{size}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CatalogoPage() {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('todos');

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    activeCategory === 'todos'
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      {/* Header */}
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

      {/* Filtros */}
      <section className="border-b border-border bg-surface sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-6 overflow-x-auto scrollbar-hide py-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`font-body text-xs tracking-widest uppercase whitespace-nowrap transition-colors pb-0.5 ${
                  activeCategory === cat.key
                    ? 'text-gold border-b border-gold'
                    : 'text-muted hover:text-cream'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        {loading ? (
          <div className="text-center py-24">
            <div className="inline-block w-6 h-6 border border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center font-body text-sm font-light text-muted py-24">
            Nenhum produto nesta categoria.
          </p>
        ) : (
          <>
            <p className="font-body text-xs font-light text-muted tracking-widest uppercase mb-8">
              {filtered.length} {filtered.length === 1 ? 'peça' : 'peças'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {filtered.map((product) => (
                <ProductItem key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* CTA */}
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

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-script text-xl text-cream/40">Arco-Íris</span>
          <p className="font-body text-xs font-light text-muted tracking-wide">
            © 2024 Boutique Arco-Íris. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
