import type React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductImage from '../components/ProductImage';
import { useAuth } from '../hooks/useAuth';
import { getProducts } from '../services/api';
import { useStagger } from '../hooks/useStagger';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { useHeroAnimation } from '../hooks/useHeroAnimation';
import { formatPrice } from '../utils/format';

const HERO_VIDEO_START_RATIO = 0.001;
const HERO_VIDEO_END_RATIO = 0.52;
const HERO_FRAME_EASING = 0.24;


export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [featured, setFeatured] = useState<Product[]>([]);
  const gridRef = useStagger([featured]);
  const {
    autoScrollReady,
    canvasRef,
    contentRef,
    posterVisible,
    sectionRef,
    videoRef,
  } = useHeroAnimation({
    startRatio: HERO_VIDEO_START_RATIO,
    endRatio: HERO_VIDEO_END_RATIO,
    easing: HERO_FRAME_EASING,
  });

  useAutoScroll({
    delay: 300,
    enabled: autoScrollReady,
    pauseOnInteraction: true,
    speed: 2.6,
    stopAt: 420,
  });

  useEffect(() => {
    getProducts()
      .then(({ products }) => {
        const priority = [7, 1, 10, 2];
        const sorted = [
          ...priority.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p)),
          ...products.filter((p) => !priority.includes(p.id)),
        ];
        setFeatured(sorted.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <section ref={sectionRef} className="relative" style={{ height: '200vh' }}>
        <div className="sticky top-0 h-screen overflow-hidden" style={{ height: '100dvh' }}>
          <video
            ref={videoRef}
            src="/hero.mp4"
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '1px',
              height: '1px',
              opacity: 0,
              pointerEvents: 'none',
            }}
          />

          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
            style={{
              backgroundImage: 'url(/hero.jpg)',
              opacity: posterVisible ? 1 : 0,
              pointerEvents: 'none',
            }}
          />

          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full transition-opacity duration-700"
            style={{
              objectFit: 'cover',
              opacity: posterVisible ? 0 : 1,
              willChange: 'contents',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
            }}
          />

          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/50 to-transparent" />

          <div className="relative h-full flex flex-col justify-center">
            <div ref={contentRef} className="max-w-6xl mx-auto px-6 w-full pt-20 md:pt-24">
              <p className="hero-line hero-line-1 hero-eyebrow">Loja Multimarcas — Buenópolis, MG</p>
              <h1 className="hero-line hero-line-2 font-display text-5xl md:text-7xl font-light text-cream leading-tight mb-4 max-w-xl">
                A luz mais brilhante
                <br />
                do <em className="font-light italic text-gold">Arco-Íris</em>
                <br />
                está dentro de você
              </h1>
              <p className="hero-line hero-line-3 font-body text-base font-light text-muted max-w-md mb-10 leading-relaxed">
                Loja Multimarcas · Enviamos para todo o Brasil e exterior
              </p>
              <div className="hero-line hero-line-4 flex flex-col sm:flex-row gap-4">
                <Link to="/catalogo" className="btn-rainbow">Compre Agora</Link>
                {isAuthenticated ? (
                  <Link to="/quiz" className="btn-gold-hero">Iniciar Consultoria</Link>
                ) : (
                  <Link to="/register" className="btn-outline-hero">Criar Conta Grátis</Link>
                )}
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted/50 animate-bounce pointer-events-none">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="border-t border-border">
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
            <div className="flex items-end justify-between mb-10 md:mb-14">
              <div>
                <p className="section-eyebrow !text-left !mb-2">Seleção Especial</p>
                <h2 className="font-display text-3xl md:text-4xl font-light text-cream">Em Destaque</h2>
              </div>
              <Link to="/catalogo" className="hidden md:inline-block font-body text-xs tracking-widest uppercase text-muted hover:text-gold transition-colors">
                Ver todos →
              </Link>
            </div>
            <div ref={gridRef as React.RefObject<HTMLDivElement>} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featured.map((product) => (
                <FeaturedCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Link to="/catalogo" className="btn-outline">Ver Catálogo Completo</Link>
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <p className="section-eyebrow">Como funciona a nossa consultoria</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
            {[
              {
                num: '01',
                title: 'Crie sua conta',
                desc: 'Cadastro simples e seguro em menos de 1 minuto. Seus dados são protegidos com criptografia.',
              },
              {
                num: '02',
                title: 'Responda o quiz',
                desc: 'Seis perguntas rápidas sobre estilo, ocasião, cores preferidas e orçamento.',
              },
              {
                num: '03',
                title: 'Receba recomendações',
                desc: 'Nossa IA analisa seu perfil e seleciona as 3 peças mais adequadas do catálogo.',
              },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <span className="font-display text-6xl font-light text-gold/20 block">{step.num}</span>
                <h3 className="font-display text-xl font-light text-cream mt-3 mb-3">{step.title}</h3>
                <p className="font-body text-sm font-light text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=80)',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
          <p className="hero-eyebrow">Tecnologia + Moda</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-cream mb-6 max-w-2xl mx-auto leading-tight">
            Sua consultora pessoal de moda, disponível 24h
          </h2>
          <p className="font-body text-sm font-light text-muted max-w-lg mx-auto mb-10 leading-relaxed">
            Combinamos inteligência artificial com curadoria de moda para entregar recomendações
            verdadeiramente personalizadas — sem julgamentos, sem confusão.
          </p>
          {isAuthenticated ? (
            <Link to="/quiz" className="btn-gold-hero">Iniciar Consultoria</Link>
          ) : (
            <Link to="/register" className="btn-gold-hero">Começar Agora — É Grátis</Link>
          )}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-14 md:py-18">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-center">
            <div>
              <p className="section-eyebrow !text-left !mb-3">Atendimento personalizado</p>
              <h2 className="font-display text-3xl md:text-4xl font-light text-cream leading-tight mb-4">
                Escolha com mais segurança, no seu ritmo.
              </h2>
              <p className="font-body text-sm font-light text-muted max-w-2xl leading-relaxed">
                Combine a curadoria da loja com a consultoria de IA para encontrar peças que façam sentido para sua rotina, ocasião e orçamento.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 md:min-w-56">
              {isAuthenticated ? (
                <Link to="/quiz" className="btn-gold-hero">Iniciar Consultoria</Link>
              ) : (
                <Link to="/register" className="btn-gold-hero">Criar Conta Grátis</Link>
              )}
              <Link to="/catalogo" className="btn-outline-hero">Ver Catálogo</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

interface FeaturedCardProps { product: Product }

function FeaturedCard({ product }: FeaturedCardProps) {
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
          <span className="absolute top-2 right-2 text-[10px] font-body tracking-widest uppercase bg-bg border border-gold/40 text-gold px-2 py-0.5">
            {product.tag}
          </span>
        )}
        <div className="card-overlay absolute inset-x-0 bottom-0 bg-cream/90 backdrop-blur-sm px-4 py-3">
          <p className="font-body text-xs font-light text-surface leading-relaxed line-clamp-2">
            {product.desc}
          </p>
          {product.sizes?.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-2">
              {product.sizes.slice(0, 4).map((size) => (
                <span key={size} className="text-[10px] font-body font-light text-surface/70 border border-surface/30 px-1.5 py-0.5">
                  {size}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <p className="font-display text-base font-light text-cream leading-snug group-hover:text-gold transition-colors duration-200">{product.name}</p>
      <p className="font-body text-sm font-light text-gold mt-0.5">{formatPrice(product.price)}</p>
    </Link>
  );
}
