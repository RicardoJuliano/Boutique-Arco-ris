import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';

export default function CartPage() {
  const { items, subtotal, removeItem, updateQty, itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  function handleCheckout() {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        <div className="mb-10">
          <p className="page-eyebrow">Sua Seleção</p>
          <h1 className="page-title">Carrinho</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 border border-border bg-surface">
            <p className="font-display text-2xl font-light text-cream mb-2">Seu carrinho está vazio</p>
            <p className="font-body text-sm font-light text-muted mb-8">Explore nosso catálogo e adicione peças que combinam com você.</p>
            <Link to="/catalogo" className="btn-gold-hero">Ver Catálogo</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Lista de itens */}
            <div className="lg:col-span-2 space-y-0 divide-y divide-border border border-border bg-surface">
              {items.map(({ product, size, quantity }) => (
                <CartItem
                  key={`${product.id}-${size}`}
                  product={product}
                  size={size}
                  quantity={quantity}
                  onRemove={() => removeItem(product.id, size)}
                  onQty={(q) => updateQty(product.id, size, q)}
                />
              ))}
            </div>

            {/* Resumo */}
            <div className="border border-border bg-surface p-6 space-y-4 lg:sticky lg:top-24">
              <h2 className="font-display text-xl font-light text-cream">Resumo</h2>
              <div className="space-y-2 py-4 border-t border-b border-border">
                <div className="flex justify-between font-body text-sm font-light text-muted">
                  <span>{itemCount} {itemCount === 1 ? 'peça' : 'peças'}</span>
                  <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between font-body text-sm font-light text-muted">
                  <span>Frete</span>
                  <span className="text-gold">Calcular no checkout</span>
                </div>
              </div>
              <div className="flex justify-between font-display text-lg font-light text-cream">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <button onClick={handleCheckout} className="btn-gold w-full py-4 text-sm tracking-widest">
                Finalizar Compra
              </button>
              <Link to="/catalogo" className="block text-center font-body text-xs tracking-widest uppercase text-muted hover:text-gold transition-colors mt-2">
                Continuar Comprando
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function CartItem({ product, size, quantity, onRemove, onQty }) {
  return (
    <div className="flex gap-4 p-5">
      <div className="w-20 h-28 bg-surface2 shrink-0 overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-2xl font-light text-gold/20">{product.name.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2">
          <h3 className="font-display text-base font-light text-cream leading-snug">{product.name}</h3>
          <button
            onClick={onRemove}
            className="text-muted hover:text-cream transition-colors text-xs font-body tracking-widest uppercase shrink-0"
          >
            Remover
          </button>
        </div>
        <p className="font-body text-xs font-light text-muted mt-0.5 tracking-wide">Tamanho: {size}</p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-border">
            <button
              onClick={() => onQty(quantity - 1)}
              className="w-8 h-8 flex items-center justify-center font-body text-muted hover:text-cream hover:bg-surface2 transition-colors"
            >−</button>
            <span className="w-8 h-8 flex items-center justify-center font-body text-sm font-light text-cream">{quantity}</span>
            <button
              onClick={() => onQty(quantity + 1)}
              className="w-8 h-8 flex items-center justify-center font-body text-muted hover:text-cream hover:bg-surface2 transition-colors"
            >+</button>
          </div>
          <p className="font-body text-sm font-light text-gold">
            R$ {(product.price * quantity).toFixed(2).replace('.', ',')}
          </p>
        </div>
      </div>
    </div>
  );
}
