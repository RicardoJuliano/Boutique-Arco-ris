import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { getProducts } from '../services/api';

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

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5 mb-3">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-gold text-sm">★</span>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    getProducts()
      .then((products) => {
        const priority = [7, 1, 10, 2];
        const sorted = [
          ...priority.map((id) => products.find((p) => p.id === id)).filter(Boolean),
          ...products.filter((p) => !priority.includes(p.id)),
        ];
        setFeatured(sorted.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-bg/30" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-40">
          <p className="hero-eyebrow">Consultora de Moda com IA</p>
          <h1 className="font-display text-5xl md:text-7xl font-light text-cream leading-tight mb-6 max-w-xl">
            Vista-se com
            <br />
            <em className="font-light italic text-gold">intenção</em>
          </h1>
          <p className="font-body text-base font-light text-muted max-w-md mb-10 leading-relaxed">
            Responda um breve questionário de estilo e deixe nossa IA selecionar
            as peças perfeitas para você do nosso catálogo exclusivo.
          </p>
          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/quiz" className="btn-gold-hero">Iniciar Consultoria</Link>
              <Link to="/catalogo" className="btn-outline-hero">Ver Catálogo</Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-gold-hero">Criar Conta Grátis</Link>
              <Link to="/catalogo" className="btn-outline-hero">Ver Catálogo</Link>
            </div>
          )}
        </div>
      </section>

      {/* Em Destaque */}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
          <p className="section-eyebrow">Como Funciona</p>
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

      {/* Footer */}
      <footer className="border-t border-border bg-bg">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-script text-2xl text-cream/70">Arco-Íris</span>
            <span className="font-body text-[9px] tracking-[0.35em] uppercase text-muted">Boutique</span>
          </div>
          <nav className="flex gap-8 font-body text-xs tracking-widest uppercase text-muted">
            <Link to="/catalogo" className="hover:text-gold transition-colors">Catálogo</Link>
            {isAuthenticated ? (
              <Link to="/quiz" className="hover:text-gold transition-colors">Consultora</Link>
            ) : (
              <Link to="/register" className="hover:text-gold transition-colors">Cadastrar</Link>
            )}
          </nav>
          <p className="font-body text-xs font-light text-muted/60 tracking-wide">
            © 2024 Boutique Arco-Íris. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeaturedCard({ product }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group cursor-default">
      <div className="relative aspect-[3/4] bg-surface2 overflow-hidden mb-3">
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-4xl font-light text-gold/20">{product.name.charAt(0)}</span>
          </div>
        )}
        {product.tag && (
          <span className="absolute top-2 right-2 text-[10px] font-body tracking-widest uppercase bg-bg border border-gold/40 text-gold px-2 py-0.5">
            {product.tag}
          </span>
        )}
      </div>
      <p className="font-display text-base font-light text-cream leading-snug">{product.name}</p>
      <p className="font-body text-sm font-light text-gold mt-0.5">
        R$ {product.price.toFixed(2).replace('.', ',')}
      </p>
    </div>
  );
}
