import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { isValidCPF, maskCPF } from '../utils/cpf';
import Navbar from '../components/Navbar';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', cpf: '', password: '' });
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

  function handleCPFChange(e: React.ChangeEvent<HTMLInputElement>) {
    const masked = maskCPF(e.target.value);
    setForm((prev) => ({ ...prev, cpf: masked }));

    const digits = masked.replace(/\D/g, '');
    if (errors.cpf) {
      if (isValidCPF(digits)) setErrors((prev) => ({ ...prev, cpf: undefined }));
    } else if (digits.length === 11 && !isValidCPF(digits)) {
      setErrors((prev) => ({ ...prev, cpf: ['CPF inválido'] }));
    }
  }

  function handleCPFBlur() {
    const digits = form.cpf.replace(/\D/g, '');
    if (digits.length > 0 && !isValidCPF(digits)) {
      setErrors((prev) => ({ ...prev, cpf: ['CPF inválido'] }));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const rawCPF = form.cpf.replace(/\D/g, '');
    if (!isValidCPF(rawCPF)) {
      setErrors({ cpf: ['CPF inválido'] });
      setIsLoading(false);
      return;
    }

    try {
      const { user } = await apiRegister(form.name, form.email, form.cpf, form.password);
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
            <label className="field-label">CPF</label>
            <input
              type="text"
              name="cpf"
              value={form.cpf}
              onChange={handleCPFChange}
              onBlur={handleCPFBlur}
              required
              inputMode="numeric"
              maxLength={14}
              autoComplete="off"
              className="field-input"
              placeholder="000.000.000-00"
            />
            {errors.cpf && (
              <p className="text-red-400/80 text-xs font-body font-light mt-1">{errors.cpf[0]}</p>
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
