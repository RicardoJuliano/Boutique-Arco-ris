import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecommendations } from '../services/api';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import type { QuizAnswers } from '../types';

const QUESTIONS = [
  {
    id: 'occasion',
    question: 'Qual é a ocasião?',
    subtitle: 'Para onde você vai usar?',
    options: ['Trabalho', 'Festa', 'Casual', 'Passeio', 'Esporte'],
    multi: false,
  },
  {
    id: 'style',
    question: 'Qual estilo te representa?',
    subtitle: 'O que mais combina com você.',
    options: ['Clássico', 'Moderno', 'Streetwear', 'Boho', 'Minimalista'],
    multi: false,
  },
  {
    id: 'colors',
    question: 'Quais cores você prefere?',
    subtitle: 'Pode escolher mais de uma.',
    options: ['Neutros', 'Tons quentes', 'Tons frios', 'Colorido'],
    multi: true,
  },
  {
    id: 'size',
    question: 'Qual é o seu tamanho?',
    subtitle: 'Para garantirmos disponibilidade.',
    options: ['P', 'M', 'G', 'GG'],
    multi: false,
  },
  {
    id: 'budget',
    question: 'Qual o seu orçamento?',
    subtitle: 'Valor por peça.',
    options: ['Até R$100', 'R$100–200', 'R$200–400', 'Acima de R$400'],
    multi: false,
  },
  {
    id: 'category',
    question: 'Tem alguma peça em mente?',
    subtitle: 'Ou deixe a IA surpreender você.',
    options: ['Camiseta / Blusa', 'Calça', 'Vestido / Saia', 'Jaqueta', 'Conjunto', 'Qualquer coisa'],
    multi: false,
  },
];

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const current = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  function selectOption(option: string) {
    const key = current.id as keyof QuizAnswers;
    if (current.multi) {
      const prev = ((answers as Record<string, unknown>)[current.id] as string[]) || [];
      const updated = prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option];
      setAnswers((a) => ({ ...a, [key]: updated }));
    } else {
      setAnswers((a) => ({ ...a, [key]: option }));
    }
  }

  function isSelected(option: string) {
    const val = (answers as Record<string, unknown>)[current.id];
    if (current.multi) return ((val as string[]) || []).includes(option);
    return val === option;
  }

  function canAdvance() {
    const val = (answers as Record<string, unknown>)[current.id];
    if (current.multi) return ((val as string[]) || []).length > 0;
    return !!val;
  }

  async function handleNext() {
    if (!canAdvance()) return;

    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setIsLoading(true);
      setError('');
      try {
        const result = await getRecommendations(answers as QuizAnswers);
        navigate('/results', { state: { result } });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro');
        setIsLoading(false);
      }
    }
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-6">
        <Spinner className="w-10 h-10" />
        <p className="font-body text-sm font-light text-muted tracking-widest">
          A consultora está analisando seu perfil...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-12 md:pb-20">
        {/* Barra de progresso */}
        <div className="mb-12">
          <div className="flex justify-between font-body text-xs font-light text-muted tracking-widest uppercase mb-3">
            <span>Pergunta {step + 1} de {QUESTIONS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-px bg-border">
            <div className="h-px bg-gold transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Pergunta */}
        <div className="mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-light text-cream mb-2">
            {current.question}
          </h2>
          <p className="font-body text-sm font-light text-muted">{current.subtitle}</p>
        </div>

        {/* Opções */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          {current.options.map((option) => (
            <button
              key={option}
              onClick={() => selectOption(option)}
              className={`quiz-option ${
                isSelected(option)
                  ? 'border-gold bg-gold/10 text-cream'
                  : 'border-border text-muted hover:border-gold/40 hover:text-cream'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {error && <p className="error-msg">{error}</p>}

        {/* Navegação */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="font-body text-sm font-light text-muted hover:text-cream transition-colors disabled:opacity-30 disabled:cursor-not-allowed tracking-widest uppercase"
          >
            ← Voltar
          </button>

          <button
            onClick={handleNext}
            disabled={!canAdvance()}
            className="btn-gold"
          >
            {step < QUESTIONS.length - 1 ? 'Próxima →' : 'Ver Recomendações'}
          </button>
        </div>
      </div>
    </div>
  );
}
