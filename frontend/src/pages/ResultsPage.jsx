import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 pt-20 text-center">
          <p className="font-body text-muted font-light mb-6">Nenhuma recomendação encontrada.</p>
          <button
            onClick={() => navigate('/quiz')}
            className="btn-gold"
          >
            Iniciar Consultoria
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-12 md:pb-20">
        {/* Cabeçalho */}
        <div className="text-center mb-14">
          <p className="page-eyebrow">Seleção Personalizada</p>
          <h1 className="font-display text-4xl md:text-5xl font-light text-cream mb-6">
            Suas Recomendações
          </h1>
          <p className="font-body text-sm font-light text-muted max-w-xl mx-auto leading-relaxed">
            {result.message}
          </p>
        </div>

        {/* Cards de produtos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {result.recommendations.map((rec, i) => (
            <ProductCard key={rec.id} product={rec.product} reason={rec.reason} index={i} />
          ))}
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate('/quiz')} className="btn-gold">
            Nova Consultoria
          </button>
          <Link to="/history" className="btn-outline">
            Ver Histórico
          </Link>
        </div>
      </div>
    </div>
  );
}
