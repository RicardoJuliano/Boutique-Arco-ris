import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login as apiLogin } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Whitelist explícita de rotas internas — impede redirect para caminhos arbitrários
  const rawFrom = location.state?.from?.pathname;
  const ALLOWED_PREFIXES = ['/quiz', '/catalogo', '/produto/', '/carrinho', '/checkout', '/history', '/pedido/'];
  const from = rawFrom && (rawFrom === '/' || ALLOWED_PREFIXES.some(p => rawFrom.startsWith(p))) ? rawFrom : '/quiz';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { user } = await apiLogin(email, password);
      login(user);
      navigate(from, { replace: true });
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message ?? 'Erro ao entrar');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <div className="max-w-md mx-auto px-6 pt-10 md:pt-20 pb-12">
        <div className="text-center mb-10">
          <h1 className="page-title">Entrar</h1>
          <p className="font-body text-sm font-light text-muted mt-2">
            Bem-vinda de volta à Boutique Arco Iris
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="field-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="field-input"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="field-label">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="field-input"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" disabled={isLoading} className="btn-gold-submit">
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center font-body text-sm font-light text-muted mt-8">
          Ainda não tem conta?{' '}
          <Link to="/register" className="text-gold hover:text-gold-hover transition-colors">
            Cadastrar
          </Link>
        </p>
      </div>
    </div>
  );
}
