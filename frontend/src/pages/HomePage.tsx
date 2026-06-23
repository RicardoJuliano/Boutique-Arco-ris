import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductImage from '../components/ProductImage';
import { useAuth } from '../hooks/useAuth';
import { getProducts } from '../services/api';
import { useStagger } from '../hooks/useStagger';
import { formatPrice } from '../utils/format';

const TESTIMONIALS = [
  {
    name: 'Mariana S.',
    city: 'São Paulo, SP',
    text: 'A consultora de IA acertou em cheio! Recebi sugestões que combinaram perfeitamente com o meu estilo e ocasião. Amei o blazer marfim.',
    stars: 5,
  },
  {
    name: 'Fernanda L.',
    city: 'Belo Horizonte, MG',
    text: 'Sempre tive dificuldade em escolher roupas para o trabalho. O quiz foi rápido e as recomendações foram muito mais certeiras do que eu esperava.',
    stars: 5,
  },
  {
    name: 'Camila R.',
    city: 'Rio de Janeiro, RJ',
    text: 'Comprei o vestido slip dress baseada na sugestão da IA e recebi elogios a noite toda. Valeu muito a pena!',
    stars: 5,
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 mb-3">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-gold text-sm">★</span>
      ))}
    </div>
  );
}

// Configuração responsiva: mobile usa menos frames e canvas menor para poupar memória
function heroConfig() {
  const mobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
  return {
    FRAMES: mobile ? 30 : 60,   // frames pré-extraídos (30 mobile / 60 desktop)
    W:      mobile ? 640 : 960, // largura interna do canvas
    H:      mobile ? 360 : 540, // altura interna do canvas
    LERP:   0.18,               // suavização por frame do RAF loop
  };
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [featured, setFeatured] = useState<Product[]>([]);
  const gridRef = useStagger([featured]);

  const videoRef       = useRef<HTMLVideoElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const heroRef        = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const [posterVisible, setPosterVisible] = useState(true);

  // Toda mutação de animação fica aqui — evita closure desatualizada dentro do RAF
  const anim = useRef({
    frames:      [] as ImageBitmap[],
    target:      0,     // índice de frame desejado (será FRAMES-1 = arara aberta)
    current:     0,     // índice suavizado via lerp
    rafId:       0,
    ready:       false, // true quando todos os frames foram extraídos
    visible:     true,  // false quando a section sai da viewport (IntersectionObserver)
    sectionTop:  0,
    scrollTrack: 1,
    FRAMES:      60,    // atualizado na init com o valor responsivo
    W:           960,
    H:           540,
    LERP:        0.18,
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

  useEffect(() => {
    const video   = videoRef.current;
    const canvas  = canvasRef.current;
    const section = heroSectionRef.current;
    if (!video || !canvas || !section) return;

    // Fallback silencioso para navegadores sem createImageBitmap (Safari < 15)
    if (typeof createImageBitmap === 'undefined') return;

    const state = anim.current;
    let aborted = false;

    // Configura tamanhos responsivos
    const cfg = heroConfig();
    const { FRAMES, W, H, LERP } = cfg;
    state.FRAMES = FRAMES;
    state.W      = W;
    state.H      = H;
    state.LERP   = LERP;
    state.target  = FRAMES - 1; // começa na arara aberta
    state.current = FRAMES - 1;

    canvas.width  = W;
    canvas.height = H;
    // alpha: false = sem composição de canal alfa (mais rápido + menos memória)
    const ctx = canvas.getContext('2d', { alpha: false })!;

    // Desenha o frame do índice informado (se disponível no cache)
    const drawFrame = (idx: number) => {
      const bitmap = state.frames[Math.round(Math.max(0, Math.min(FRAMES - 1, idx)))];
      if (bitmap) ctx.drawImage(bitmap, 0, 0, W, H);
    };

    // Recalcula posição e tamanho da seção (chamado no mount e no resize)
    const measure = () => {
      state.sectionTop  = section.getBoundingClientRect().top + window.scrollY;
      // scrollTrack: distância total de scroll enquanto o hero fica preso (sticky)
      state.scrollTrack = Math.max(1, section.offsetHeight - window.innerHeight);
    };

    // Scroll handler: só calcula state.target — zero manipulação de DOM aqui
    const onScroll = () => {
      const scrolledIn = Math.max(0, window.scrollY - state.sectionTop);
      // scrolledIn=0 → progress=1 (arara aberta) | scrolledIn=scrollTrack → progress=0 (fechada)
      const progress = 1 - Math.min(1, scrolledIn / state.scrollTrack);
      state.target = progress * (FRAMES - 1);
    };

    // RAF loop: único responsável por escrever no canvas, a cada ~16ms (60 FPS)
    const tick = () => {
      if (state.ready && state.visible) {
        const diff = state.target - state.current;
        if (Math.abs(diff) > 0.15) {
          state.current += diff * LERP;
          drawFrame(state.current);
        }
      }
      state.rafId = requestAnimationFrame(tick);
    };

    // Seek seguro: aguarda o evento "seeked" com timeout de 5s para evitar hang
    const seekTo = (t: number) =>
      new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          video.removeEventListener('seeked', fn);
          reject(new Error(`seek timeout at ${t.toFixed(3)}s`));
        }, 5000);
        const fn = () => {
          clearTimeout(timer);
          video.removeEventListener('seeked', fn);
          resolve();
        };
        video.addEventListener('seeked', fn);
        video.currentTime = t;
      });

    // Extração: pré-renderiza os frames no canvas e salva como ImageBitmap (GPU)
    const extractFrames = async () => {
      const dur = video.duration;
      if (!dur || !isFinite(dur)) return;

      // Canvas temporário off-screen: extrai frames sem aparecer na tela
      const tmp    = document.createElement('canvas');
      tmp.width    = W;
      tmp.height   = H;
      const tmpCtx = tmp.getContext('2d', { alpha: false })!;
      const frames: ImageBitmap[] = new Array(FRAMES);

      // Extrai o último frame primeiro (arara aberta) para exibição imediata
      // Usa dur*0.999 para evitar problemas de "end of stream" em alguns browsers
      await seekTo(dur * 0.999);
      if (aborted) return;
      tmpCtx.drawImage(video, 0, 0, W, H);
      frames[FRAMES - 1] = await createImageBitmap(tmp);
      // Exibe imediatamente no canvas visível e ativa crossfade poster→canvas
      ctx.drawImage(frames[FRAMES - 1], 0, 0, W, H);
      setPosterVisible(false);

      // Extrai os frames restantes em ordem crescente (0 → FRAMES-2)
      for (let i = 0; i < FRAMES - 1; i++) {
        if (aborted) return;
        await seekTo((i / (FRAMES - 1)) * dur);
        if (aborted) return;
        tmpCtx.drawImage(video, 0, 0, W, H);
        frames[i] = await createImageBitmap(tmp);
      }

      state.frames  = frames;
      state.current = state.target; // snapa para posição atual do scroll (sem salto)
      state.ready   = true;
    };

    // IntersectionObserver:
    // - pausa o RAF quando a seção sai da viewport (economiza CPU/bateria)
    // - RESETA para arara aberta quando o usuário sai da seção, para que ao
    //   retornar ao topo a próxima visita comece com a animação completa
    const io = new IntersectionObserver(
      ([entry]) => {
        state.visible = entry.isIntersecting;
        if (!entry.isIntersecting && state.ready) {
          state.target  = FRAMES - 1;
          state.current = FRAMES - 1;
          drawFrame(FRAMES - 1); // garante que o canvas mostra a arara aberta
        }
      },
      { threshold: 0 }
    );
    io.observe(section);

    measure();
    state.rafId = requestAnimationFrame(tick);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure,  { passive: true });

    const onCanPlay = () => {
      video.pause();
      measure();
      onScroll(); // sincroniza target com scroll atual antes de extrair
      extractFrames().catch(console.error);
    };

    if (video.readyState >= 2) onCanPlay();
    else video.addEventListener('canplay', onCanPlay, { once: true });

    return () => {
      aborted = true;
      cancelAnimationFrame(state.rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      io.disconnect();
      // Libera memória de GPU de todos os ImageBitmaps
      state.frames.forEach(b => b.close());
      state.frames = [];
      state.ready  = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      {/*
        Hero scrollytelling
        ─ Seção de 200vh: 100vh de scroll track enquanto o hero está preso
        ─ 200dvh usa dynamic viewport (resolve barra de endereço do Safari iOS)
        ─ Fallback para 200vh em browsers sem suporte a dvh
      */}
      <section
        ref={heroSectionRef}
        className="relative"
        style={{ height: '200vh' }}
      >
        {/*
          Div sticky: permanece na tela enquanto o usuário rola dentro da seção pai.
          h-screen = 100vh (fallback); height: 100dvh = dynamic viewport height
          que exclui a barra de endereço do mobile (Safari iOS, Chrome Android).
        */}
        <div
          ref={heroRef}
          className="sticky top-0 h-screen overflow-hidden"
          style={{ height: '100dvh' }}
        >
          {/*
            Vídeo oculto visualmente mas presente no DOM.
            Usar position absolute 1x1 ao invés de display:none porque iOS Safari
            pode ter problemas para fazer seek em vídeos com display:none.
          */}
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
              top: 0, left: 0,
              width: '1px', height: '1px',
              opacity: 0,
              pointerEvents: 'none',
            }}
          />

          {/* Poster: visível enquanto os frames são extraídos, depois fade out */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
            style={{
              backgroundImage: 'url(/hero.jpg)',
              opacity: posterVisible ? 1 : 0,
              pointerEvents: 'none',
            }}
          />

          {/*
            Canvas: layer GPU dedicada para os frames pré-extraídos.
            will-change: contents  — reserva compositing layer própria
            translateZ(0)          — força aceleração de hardware (GPU rasterização)
            backfaceVisibility     — evita repaint em rotações 3D em algumas GPUs
            objectFit: cover       — CSS escala o conteúdo 960x540 para cobrir o container
                                     (suportado em canvas em todos os browsers modernos)
          */}
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

          {/* Conteúdo — centralizado verticalmente com espaço para a navbar */}
          <div className="relative h-full flex flex-col justify-center">
            <div className="max-w-6xl mx-auto px-6 w-full pt-20 md:pt-24">
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

          {/* Indicador de scroll — some quando usuário começa a rolar */}
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

      {/* Como Funciona */}
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

      {/* Banner IA */}
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

      {/* Depoimentos */}
      <section className="border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <p className="section-eyebrow">Depoimentos</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-bg border border-border p-6 md:p-8">
                <StarRating count={t.stars} />
                <p className="font-body text-sm font-light text-cream/80 leading-relaxed mb-5 italic">
                  "{t.text}"
                </p>
                <div>
                  <p className="font-body text-sm font-light text-cream">{t.name}</p>
                  <p className="font-body text-xs font-light text-muted tracking-wide">{t.city}</p>
                </div>
              </div>
            ))}
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
              {product.sizes.slice(0, 4).map((s) => (
                <span key={s} className="text-[10px] font-body font-light text-surface/70 border border-surface/30 px-1.5 py-0.5">
                  {s}
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
