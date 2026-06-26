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
import { useAutoScroll } from '../hooks/useAutoScroll';
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

// Configuração responsiva
function heroConfig() {
  const mobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
  return {
    FRAMES: mobile ? 15 : 30, // 30 frames = ~3s extração vs ~6s antes; suave o suficiente
    W:      mobile ? 640 : 960,
    H:      mobile ? 360 : 540,
  };
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [featured, setFeatured] = useState<Product[]>([]);
  const gridRef = useStagger([featured]);

  const videoRef        = useRef<HTMLVideoElement>(null);
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const heroSectionRef  = useRef<HTMLDivElement>(null);
  const heroContentRef  = useRef<HTMLDivElement>(null);
  const [posterVisible, setPosterVisible] = useState(true);

  // Auto-scroll rápido: aguarda extração de frames (~3s) e depois dá um nudge
  // visível de ~350px para mostrar a arara fechando. speed:4 = 240px/s → chega
  // em 350px em ~1.5s, colocando a arara ~23% fechada de forma claramente percebida.
  useAutoScroll({
    speed:               4,
    pauseOnInteraction:  true,
    stopAt:              350,
    delay:               3000,
  });

  // Toda mutação de animação fica aqui — evita closure desatualizada dentro do RAF
  const anim = useRef({
    frames:    [] as ImageBitmap[],
    target:    0,      // índice de frame alvo (atualizado pelo scroll handler)
    lastDrawn: -1,     // último índice desenhado no canvas (evita draws redundantes)
    rafId:     0,
    ready:     false,  // true após todos os frames extraídos
    visible:   true,
    sectionTop:  0,
    scrollTrack: 1,
    FRAMES:      30,
    W:           960,
    H:           540,
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

    const cfg = heroConfig();
    const { FRAMES, W, H } = cfg;
    state.FRAMES    = FRAMES;
    state.W         = W;
    state.H         = H;
    state.target    = 0;
    state.lastDrawn = -1;

    canvas.width  = W;
    canvas.height = H;
    // alpha: false = sem composição de canal alfa (mais rápido + menos memória)
    const ctx = canvas.getContext('2d', { alpha: false })!;

    // Desenha o frame mais próximo disponível no cache.
    // Durante a extração progressiva, alguns índices ainda estão undefined —
    // buscamos o frame extraído mais próximo para não travar a animação.
    const drawFrame = (idx: number) => {
      const target = Math.round(Math.max(0, Math.min(FRAMES - 1, idx)));
      let bitmap = state.frames[target];
      if (!bitmap) {
        for (let j = target - 1; j >= 0; j--) {
          if (state.frames[j]) { bitmap = state.frames[j]; break; }
        }
        if (!bitmap) {
          for (let j = target + 1; j < FRAMES; j++) {
            if (state.frames[j]) { bitmap = state.frames[j]; break; }
          }
        }
      }
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
      // scrolledIn=0 → progress=0 (fechada) | scrolledIn=scrollTrack → progress=1 (aberta)
      // Scroll para baixo = abre; scroll para cima = fecha
      const progress = Math.min(1, scrolledIn / state.scrollTrack);
      state.target = progress * (FRAMES - 1);
    };

    // RAF loop: sincroniza canvas com target apenas quando o índice muda.
    // Sem LERP — o scroll controla diretamente, sem lag artificial.
    const tick = () => {
      if (state.ready && state.visible) {
        const frameIdx = Math.round(state.target);
        if (frameIdx !== state.lastDrawn) {
          state.lastDrawn = frameIdx;
          drawFrame(frameIdx);
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

    // Extração progressiva de frames:
    // 1. Extrai frame 0 (fechada) imediatamente → animação inicia já
    // 2. Extrai os demais em background → qualidade melhora continuamente
    const extractFrames = async () => {
      const dur = video.duration;
      if (!dur || !isFinite(dur)) return;

      const tmp    = document.createElement('canvas');
      tmp.width    = W;
      tmp.height   = H;
      const tmpCtx = tmp.getContext('2d', { alpha: false })!;

      // Aponta state.frames para o array ANTES de começar, para que drawFrame
      // possa acessar os frames já extraídos enquanto os demais ainda processam.
      const frames: ImageBitmap[] = new Array(FRAMES);
      state.frames = frames;

      // Frame 0: início do vídeo (arara fechada) — keyframe, seek quase instantâneo
      await seekTo(dur * 0.001);
      if (aborted) return;
      tmpCtx.drawImage(video, 0, 0, W, H);
      frames[0] = await createImageBitmap(tmp);
      ctx.drawImage(frames[0], 0, 0, W, H);
      setPosterVisible(false);

      // Animação começa AQUI — só frame 0 disponível, os demais chegam em background.
      state.lastDrawn = -1; // força redraw no próximo tick
      state.ready     = true;

      // Frames 1 → FRAMES-2 em sequência
      for (let i = 1; i < FRAMES - 1; i++) {
        if (aborted) return;
        await seekTo((i / (FRAMES - 1)) * dur);
        if (aborted) return;
        tmpCtx.drawImage(video, 0, 0, W, H);
        frames[i] = await createImageBitmap(tmp);
      }

      // Frame FRAMES-1: fim do vídeo (arara aberta) — 0.999 evita end-of-stream
      if (!aborted) {
        await seekTo(dur * 0.999);
        if (!aborted) {
          tmpCtx.drawImage(video, 0, 0, W, H);
          frames[FRAMES - 1] = await createImageBitmap(tmp);
        }
      }
    };

    // IntersectionObserver:
    // - pausa o RAF quando a seção sai da viewport (economiza CPU/bateria)
    // - Mantém a arara ABERTA ao sair (estado final do scroll para baixo).
    //   Quando o usuário voltar rolando para cima, a arara fechará corretamente.
    const io = new IntersectionObserver(
      ([entry]) => {
        state.visible = entry.isIntersecting;
        if (!entry.isIntersecting && state.ready) {
          state.target    = FRAMES - 1;
          state.lastDrawn = FRAMES - 1;
          drawFrame(FRAMES - 1);
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

  // Parallax: conteúdo do hero desce levemente e desbota enquanto o usuário rola
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const content = heroContentRef.current;
    if (!content) return;
    const onScroll = () => {
      const y = window.scrollY;
      content.style.transform = `translateY(${y * 0.3}px)`;
      content.style.opacity   = String(Math.max(0, 1 - y / 600));
    };
    onScroll(); // sincroniza com posição atual ao montar
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
            <div ref={heroContentRef} className="max-w-6xl mx-auto px-6 w-full pt-20 md:pt-24">
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
