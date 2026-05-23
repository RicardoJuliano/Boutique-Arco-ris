import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string[] | string | undefined>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const { user } = await apiRegister(form.name, form.email, form.password);
      login(user);
      navigate('/quiz');
    } catch (err) {
      const error = err as { details?: Record<string, string[]>; message?: string };
      if (error.details) {
        setErrors(error.details);
      } else {
        setErrors({ _global: error.message ?? 'Erro ao criar conta' });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <div className="max-w-md mx-auto px-6 pt-10 md:pt-20 pb-12">
        <div className="text-center mb-10">
          <h1 className="page-title">Criar Conta</h1>
          <p className="font-body text-sm font-light text-muted mt-2">
            Junte-se à Boutique Arco Iris e descubra seu estilo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="field-label">Nome</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
              className="field-input"
              placeholder="Seu nome completo"
            />
            {errors.name && (
              <p className="text-red-400/80 text-xs font-body font-light mt-1">{errors.name[0]}</p>
            )}
          </div>

          <div>
            <label className="field-label">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="field-input"
              placeholder="seu@email.com"
            />
            {errors.email && (
              <p className="text-red-400/80 text-xs font-body font-light mt-1">{errors.email[0]}</p>
            )}
          </div>

          <div>
            <label className="field-label">Senha</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              minLength={8}
              className="field-input"
              placeholder="Mínimo 8 caracteres"
            />
            {errors.password && (
              <p className="text-red-400/80 text-xs font-body font-light mt-1">{errors.password[0]}</p>
            )}
          </div>

          {errors._global && <p className="error-msg">{errors._global}</p>}

          <button type="submit" disabled={isLoading} className="btn-gold-submit">
            {isLoading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <p className="text-center font-body text-sm font-light text-muted mt-8">
          Já tem conta?{' '}
          <Link to="/login" className="text-gold hover:text-gold-hover transition-colors">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
