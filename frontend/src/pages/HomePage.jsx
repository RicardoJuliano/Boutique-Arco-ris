import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-14 md:pt-24 pb-14 md:pb-20 text-center">
        <p className="hero-eyebrow">Consultora de Moda com IA</p>
        <h1 className="font-display text-5xl md:text-7xl font-light text-cream leading-tight mb-6">
          Vista-se com
          <br />
          <em className="font-light italic">intenção</em>
        </h1>
        <p className="font-body text-base font-light text-muted max-w-xl mx-auto mb-12 leading-relaxed">
          Responda um breve questionário de estilo e deixe nossa IA selecionar as
          peças perfeitas para você — do catálogo Élite Moda.
        </p>

        {isAuthenticated ? (
          <Link to="/quiz" className="btn-gold-hero">
            Iniciar Consultoria
          </Link>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-gold-hero">Criar Conta</Link>
            <Link to="/login" className="btn-outline-hero">Entrar</Link>
          </div>
        )}
      </section>

      {/* Como funciona */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
          <p className="section-eyebrow">Como Funciona</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                num: '01',
                title: 'Crie sua conta',
                desc: 'Cadastro simples e seguro. Seus dados são protegidos com criptografia.',
              },
              {
                num: '02',
                title: 'Responda o quiz',
                desc: 'Seis perguntas rápidas sobre estilo, ocasião, cores e orçamento.',
              },
              {
                num: '03',
                title: 'Receba recomendações',
                desc: 'Nossa IA analisa seu perfil e seleciona as 3 peças mais adequadas do catálogo.',
              },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <span className="font-display text-5xl font-light text-gold/20">{step.num}</span>
                <h3 className="font-display text-xl font-light text-cream mt-3 mb-3">{step.title}</h3>
                <p className="font-body text-sm font-light text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display text-lg font-light tracking-[0.15em] text-cream/40">ÉLITE MODA</span>
          <p className="font-body text-xs font-light text-muted tracking-wide">© 2024 Élite Moda. Projeto de portfólio.</p>
        </div>
      </footer>
    </div>
  );
}
