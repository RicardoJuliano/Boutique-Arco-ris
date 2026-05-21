import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getOrder } from '../services/api';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    getOrder(id)
      .then(({ order }) => setOrder(order))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <div className="w-8 h-8 border border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <p className="error-msg">{error || 'Pedido não encontrado'}</p>
        </div>
      </>
    );
  }

  const statusLabel = {
    processing: 'Em Processamento',
    shipped: 'Enviado',
    delivered: 'Entregue',
  }[order.status] || order.status;

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        {/* Ícone de confirmação */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 border border-gold rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-gold text-2xl">✓</span>
          </div>
          <p className="page-eyebrow">Pedido Confirmado</p>
          <h1 className="font-display text-3xl md:text-4xl font-light text-cream mt-1">
            Obrigada pela compra!
          </h1>
          <p className="font-body text-sm font-light text-muted mt-3">
            Pedido <span className="text-cream">#{String(order.id).padStart(6, '0')}</span> · {statusLabel}
          </p>
        </div>

        {/* Itens */}
        <div className="border border-border bg-surface divide-y divide-border mb-6">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 p-5">
              <div className="w-16 h-22 bg-surface2 shrink-0 overflow-hidden">
                {item.image_url
                  ? <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><span className="font-display text-xl text-gold/20">{item.product_name.charAt(0)}</span></div>
                }
              </div>
              <div className="flex-1">
                <p className="font-display text-base font-light text-cream">{item.product_name}</p>
                <p className="font-body text-xs font-light text-muted mt-0.5">Tamanho: {item.size} · Qtd: {item.quantity}</p>
                <p className="font-body text-sm font-light text-gold mt-1">
                  R$ {(item.unit_price * item.quantity).toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Totais e entrega */}
        <div className="border border-border bg-surface p-5 space-y-3 mb-8">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-body text-xs font-light text-muted tracking-widest uppercase mb-1">Entrega</p>
              <p className="font-body font-light text-cream">{order.address.street}</p>
              <p className="font-body font-light text-muted">{order.address.city} – {order.address.state}</p>
              <p className="font-body font-light text-muted">{order.address.zip}</p>
            </div>
            <div>
              <p className="font-body text-xs font-light text-muted tracking-widest uppercase mb-1">Pagamento</p>
              <p className="font-body font-light text-cream capitalize">{order.payment_method === 'pix' ? 'Pix' : 'Cartão de Crédito'}</p>
              <p className="font-body font-light text-muted capitalize">{order.shipping_method === 'pac' ? 'PAC' : 'SEDEX'}</p>
            </div>
          </div>
          <div className="border-t border-border pt-3 space-y-1">
            <div className="flex justify-between font-body text-sm font-light text-muted">
              <span>Subtotal</span>
              <span>R$ {(order.total - order.shipping_fee).toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between font-body text-sm font-light text-muted">
              <span>Frete</span>
              <span>R$ {order.shipping_fee.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between font-display text-base font-light text-cream pt-1">
              <span>Total</span>
              <span>R$ {order.total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/catalogo" className="btn-gold-hero">Continuar Comprando</Link>
          <Link to="/" className="btn-outline-hero">Ir para o Início</Link>
        </div>
      </main>
    </div>
  );
}
