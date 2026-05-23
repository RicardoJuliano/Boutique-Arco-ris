import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory } from '../services/api';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import type { HistoryEntry, Recommendation } from '../types';

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getHistory()
      .then(({ history }) => setHistory(history))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="flex justify-center pt-20">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-12 md:pb-20">
        <div className="mb-12">
          <p className="page-eyebrow">Seu Estilo</p>
          <h1 className="page-title">Histórico de Consultorias</h1>
        </div>

        {error && <p className="error-msg-page">{error}</p>}

        {!error && history.length === 0 && (
          <div className="text-center py-20">
            <p className="font-body text-sm font-light text-muted mb-6">
              Você ainda não fez nenhuma consultoria.
            </p>
            <button onClick={() => navigate('/quiz')} className="btn-gold">
              Iniciar Consultoria
            </button>
          </div>
        )}

        <div className="flex flex-col gap-16">
          {history.map((record, recordIndex) => (
            <div key={record.id}>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div>
                  <span className="font-body text-xs font-light tracking-widest uppercase text-muted">
                    Consultoria #{history.length - recordIndex}
                  </span>
                  <p className="font-body text-sm font-light text-cream/60 mt-1">
                    {new Date(record.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="hidden md:flex gap-2 flex-wrap justify-end">
                  {[
                    record.answers.occasion,
                    record.answers.style,
                    record.answers.size,
                    record.answers.budget,
                  ].filter((tag): tag is string => typeof tag === 'string').map((tag) => (
                    <span key={tag} className="badge">{tag}</span>
                  ))}
                </div>
              </div>

              <p className="font-body text-sm font-light text-muted mb-6 leading-relaxed">
                {record.result.message}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {record.result.recommendations.map((rec: Recommendation, i: number) => (
                  rec.product && (
                    <ProductCard key={rec.id} product={rec.product} reason={rec.reason} index={i} />
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
