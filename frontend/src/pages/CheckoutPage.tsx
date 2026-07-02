import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/format';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { createOrder, getFreight } from '../services/api';
import type { FreightResponse } from '../types';

const STEPS = ['EndereÃ§o', 'Pagamento', 'RevisÃ£o'];

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep]     = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const [cep, setCep]               = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError]     = useState('');
  const [address, setAddress]       = useState({
    name: '', street: '', district: '', city: '', state: '', zip: '', phone: '', complement: '',
  });

  const [freightOptions, setFreightOptions] = useState<FreightResponse['shipping'] | null>(null);
  const [shippingMethod, setShippingMethod] = useState('pac');

  const [paymentMethod] = useState('pix');

  const cepTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shipping    = freightOptions?.[shippingMethod as keyof FreightResponse['shipping']];
  const shippingFee = shipping?.price ?? 0;
  const total       = subtotal + shippingFee;

  // redireciona para o carrinho se ele for esvaziado durante o checkout
  useEffect(() => {
    if (items.length === 0) navigate('/carrinho');
  }, [items.length, navigate]);

  useEffect(() => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) {
      setFreightOptions(null);
      setCepError('');
      setAddress((prev) => ({ ...prev, street: '', district: '', city: '', state: '', zip: '' }));
      return;
    }

    if (cepTimeout.current) clearTimeout(cepTimeout.current);
    cepTimeout.current = setTimeout(async () => {
      setCepLoading(true);
      setCepError('');
      try {
        const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);
        const data = await getFreight(digits, itemCount);
        setFreightOptions(data.shipping);
        setAddress(prev => ({
          ...prev,
          street:   prev.street   || data.address.street,
          district: prev.district || data.address.district,
          city:     prev.city     || data.address.city,
          state:    prev.state    || data.address.state,
          zip:      data.address.zip,
        }));
      } catch (e) {
        setCepError(e instanceof Error ? e.message : 'Erro ao calcular frete');
        setFreightOptions(null);
      } finally {
        setCepLoading(false);
      }
    }, 600);

    return () => { if (cepTimeout.current) clearTimeout(cepTimeout.current); };
  }, [cep, items]);

  function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
    const fmt = raw.length > 5 ? `${raw.slice(0, 5)}-${raw.slice(5)}` : raw;
    setCep(fmt);
  }

  function handleAddrChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function fillTestData() {
    setCep('01310-100');
    setAddress(prev => ({ ...prev, name: 'Teste da Silva', phone: '(11) 91234-5678' }));
  }

  async function handleSubmit() {
    setError('');
    setSaving(true);
    try {
      const payload = {
        items:          items.map(i => ({ productId: i.product.id, size: i.size, quantity: i.quantity })),
        address:        { ...address, zip: cep },
        shippingMethod,
        paymentMethod,
        shippingFee,
      };
      const data = await createOrder(payload);
      clearCart();
      navigate(`/pedido/${data.orderId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao confirmar pedido');
    } finally {
      setSaving(false);
    }
  }

  const canProceed =
    address.name && address.street && address.city &&
    address.state && address.phone && freightOptions;

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <div className="mb-10">
          <p className="page-eyebrow">Finalizar Compra</p>
          <h1 className="page-title">Checkout</h1>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 ${i < step ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center font-body text-xs transition-colors duration-200
                  ${i === step ? 'bg-gold text-bg' : i < step ? 'bg-gold/40 text-gold' : 'bg-border text-muted'}`}>
                  {i + 1}
                </span>
                <span className={`font-body text-xs tracking-widest uppercase hidden sm:block transition-colors duration-200
                  ${i === step ? 'text-cream' : 'text-muted'}`}>{s}</span>
              </button>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border mx-3" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">

            {/* â”€â”€ ETAPA 0: ENDEREÃ‡O + FRETE â”€â”€ */}
            {step === 0 && (
              <div className="border border-border bg-surface p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-light text-cream">EndereÃ§o de Entrega</h2>
                  <button
                    type="button"
                    onClick={fillTestData}
                    className="font-body text-xs font-light text-muted/60 border border-border/60 px-3 py-1 hover:text-gold hover:border-gold/40 transition-colors"
                  >
                    Preencher teste
                  </button>
                </div>

                <div>
                  <label className="field-label">CEP</label>
                  <div className="relative">
                    <input
                      value={cep}
                      onChange={handleCepChange}
                      className="field-input pr-10"
                      placeholder="00000-000"
                      maxLength={9}
                      inputMode="numeric"
                    />
                    {cepLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border border-gold border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {freightOptions && !cepLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gold text-sm">âœ“</div>
                    )}
                  </div>
                  {cepError && (
                    <p className="font-body text-xs font-light text-red-400/80 mt-1.5">{cepError}</p>
                  )}
                  {!freightOptions && !cepLoading && !cepError && cep.replace(/\D/g,'').length < 8 && (
                    <p className="font-body text-xs font-light text-muted mt-1.5">
                      Digite o CEP para calcular o frete e preencher o endereÃ§o automaticamente.
                    </p>
                  )}
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-300 ${freightOptions ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  <div className="sm:col-span-2">
                    <label className="field-label">Nome completo do destinatÃ¡rio</label>
                    <input name="name" value={address.name} onChange={handleAddrChange} className="field-input" placeholder="Maria Silva" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="field-label">Logradouro</label>
                    <input name="street" value={address.street} onChange={handleAddrChange} className="field-input" placeholder="Rua das Flores, 123" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="field-label">Complemento <span className="normal-case text-muted/60">(opcional)</span></label>
                    <input name="complement" value={address.complement} onChange={handleAddrChange} className="field-input" placeholder="Apto 4, Bloco B" />
                  </div>
                  <div>
                    <label className="field-label">Bairro</label>
                    <input name="district" value={address.district} onChange={handleAddrChange} className="field-input" placeholder="Centro" />
                  </div>
                  <div>
                    <label className="field-label">Cidade</label>
                    <input name="city" value={address.city} onChange={handleAddrChange} className="field-input" placeholder="SÃ£o Paulo" />
                  </div>
                  <div>
                    <label className="field-label">Estado</label>
                    <input name="state" value={address.state} onChange={handleAddrChange} className="field-input" placeholder="SP" maxLength={2} style={{ textTransform: 'uppercase' }} />
                  </div>
                  <div>
                    <label className="field-label">Telefone</label>
                    <input name="phone" value={address.phone} onChange={handleAddrChange} className="field-input" placeholder="(11) 91234-5678" />
                  </div>
                </div>

                {freightOptions && (
                  <div className="border-t border-border pt-5">
                    <h3 className="font-body text-xs tracking-widest uppercase text-muted mb-4">
                      OpÃ§Ãµes de Entrega â€” PreÃ§os Correios 2025
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(freightOptions).map(([key, opt]) => (
                        <label
                          key={key}
                          className={`flex items-center justify-between p-4 border cursor-pointer transition-all duration-200
                            ${shippingMethod === key ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/40'}`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shipping"
                              checked={shippingMethod === key}
                              onChange={() => setShippingMethod(key)}
                              className="accent-gold"
                            />
                            <div>
                              <p className="font-body text-sm font-light text-cream">{opt.label}</p>
                              <p className="font-body text-xs font-light text-muted">Correios â€¢ CÃ³digo {opt.code}</p>
                            </div>
                          </div>
                          <span className="font-display text-base font-light text-gold">
                            {formatPrice(opt.price)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setStep(1)}
                  disabled={!canProceed}
                  className="btn-gold w-full py-4 mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {!freightOptions ? 'Calcule o frete para continuar' : 'Continuar para Pagamento'}
                </button>
              </div>
            )}

            {/* â”€â”€ ETAPA 1: PAGAMENTO â”€â”€ */}
            {step === 1 && (
              <div className="border border-border bg-surface p-6 space-y-4">
                <h2 className="font-display text-xl font-light text-cream mb-4">MÃ©todo de Pagamento</h2>
                <div className="space-y-2">
                  {[
                    { key: 'pix',  label: 'Pix',              desc: 'Pagamento instantÃ¢neo com QR Code' },
                    { key: 'card', label: 'CartÃ£o de CrÃ©dito', desc: 'Visa, Mastercard, Elo e outros' },
                  ].map(({ key, label, desc }) => (
                    <label
                      key={key}
                      className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors duration-200
                        ${paymentMethod === key ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/40'}`}
                    >
                      <input type="radio" name="payment" checked={paymentMethod === key} readOnly className="accent-gold mt-1" />
                      <div>
                        <p className="font-body text-sm font-light text-cream">{label}</p>
                        <p className="font-body text-xs font-light text-muted">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {paymentMethod === 'pix' && (
                  <div className="border border-border bg-surface2 p-6 text-center">
                    <div className="w-28 h-28 bg-border/60 mx-auto mb-3 flex items-center justify-center">
                      <span className="font-body text-xs text-muted">QR Code</span>
                    </div>
                    <p className="font-body text-xs font-light text-muted">
                      O QR Code Pix serÃ¡ gerado ao confirmar o pedido.
                    </p>
                  </div>
                )}

                <div className="border border-border bg-surface2 p-4">
                  <p className="font-body text-xs font-light text-muted">
                    Pagamento por cartão será habilitado apenas via provedor tokenizado.
                  </p>
                </div>
                <div className="flex gap-3 mt-2">
                  <button onClick={() => setStep(0)} className="btn-outline px-6 py-3">Voltar</button>
                  <button onClick={() => setStep(2)} className="btn-gold flex-1 py-3">Revisar Pedido</button>
                </div>
              </div>
            )}

            {/* â”€â”€ ETAPA 2: REVISÃƒO â”€â”€ */}
            {step === 2 && (
              <div className="border border-border bg-surface p-6 space-y-5">
                <h2 className="font-display text-xl font-light text-cream">RevisÃ£o do Pedido</h2>

                <div className="divide-y divide-border">
                  {items.map(({ product, size, quantity }) => (
                    <div key={`${product.id}-${size}`} className="flex gap-3 py-3">
                      <div className="w-14 h-20 bg-surface2 shrink-0 overflow-hidden">
                        {product.image_url
                          ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><span className="font-display text-xl text-gold/20">{product.name.charAt(0)}</span></div>
                        }
                      </div>
                      <div className="flex-1">
                        <p className="font-display text-sm font-light text-cream">{product.name}</p>
                        <p className="font-body text-xs font-light text-muted">Tam. {size} Â· Qtd. {quantity}</p>
                        <p className="font-body text-sm font-light text-gold mt-1">{formatPrice(product.price * quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-1.5">
                  <p className="font-body text-xs font-light text-muted tracking-widest uppercase mb-2">Entrega</p>
                  <p className="font-body text-sm font-light text-cream">
                    {address.street}{address.complement ? `, ${address.complement}` : ''}
                  </p>
                  <p className="font-body text-sm font-light text-muted">
                    {address.district && `${address.district} Â· `}{address.city} â€“ {address.state} Â· CEP {cep}
                  </p>
                  <p className="font-body text-sm font-light text-muted">{shipping?.label}</p>
                </div>

                <div className="border-t border-border pt-4 space-y-1.5">
                  <p className="font-body text-xs font-light text-muted tracking-widest uppercase mb-2">Pagamento</p>
                  <p className="font-body text-sm font-light text-cream">
                    {paymentMethod === 'pix' ? 'Pix' : 'CartÃ£o de CrÃ©dito'}
                  </p>
                </div>

                {error && <p className="error-msg !text-left">{error}</p>}

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-outline px-6 py-3">Voltar</button>
                  <button onClick={handleSubmit} disabled={saving} className="btn-gold flex-1 py-3">
                    {saving ? 'Processando...' : 'Confirmar Pedido'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Resumo lateral */}
          <div className="border border-border bg-surface p-5 space-y-3 lg:sticky lg:top-24">
            <h3 className="font-display text-base font-light text-cream">Resumo</h3>
            <div className="space-y-1.5 border-t border-border pt-3">
              {items.map(({ product, size, quantity }) => (
                <div key={`${product.id}-${size}`} className="flex justify-between font-body text-xs font-light text-muted">
                  <span className="truncate pr-2">{product.name} ({size}) Ã—{quantity}</span>
                  <span className="shrink-0">{formatPrice(product.price * quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-1.5">
              <div className="flex justify-between font-body text-sm font-light text-muted">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between font-body text-sm font-light text-muted">
                <span>Frete {shipping ? `(${shippingMethod.toUpperCase()})` : ''}</span>
                <span>
                  {freightOptions
                    ? formatPrice(shippingFee)
                    : <span className="text-gold/70 text-xs">calcular CEP</span>
                  }
                </span>
              </div>
            </div>
            <div className="flex justify-between font-display text-base font-light text-cream border-t border-border pt-3">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

