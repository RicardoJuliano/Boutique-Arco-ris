import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  function close() { setIsOpen(false); }

  async function handleLogout() {
    await logout();
    navigate('/');
    close();
  }

  return (
    <nav className="bg-surface border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" onClick={close} className="flex flex-col items-start leading-none hover:opacity-75 transition-opacity">
          <span className="font-script text-3xl text-cream">Arco-Íris</span>
          <span className="font-body text-[9px] tracking-[0.35em] uppercase text-muted -mt-1">Boutique</span>
        </Link>

        {/* Links — desktop */}
        <div className="hidden md:flex items-center gap-6 font-body text-sm font-light tracking-widest uppercase">
          {isAuthenticated ? (
            <>
              <span className="text-muted">Olá, {user?.name?.split(' ')[0]}</span>
              <Link to="/quiz" className="nav-link">Consultora</Link>
              <Link to="/history" className="nav-link">Histórico</Link>
              {isAdmin && (
                <Link to="/admin/produtos" className="nav-link text-gold">Admin</Link>
              )}
              <button onClick={handleLogout} className="btn-nav">Sair</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Entrar</Link>
              <Link to="/register" className="btn-nav">Cadastrar</Link>
            </>
          )}
        </div>

        {/* Hambúrguer — mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex flex-col justify-center gap-[5px] w-8 h-8"
          aria-label="Menu"
        >
          <span className={`block h-px bg-cream transition-all duration-300 origin-center ${isOpen ? 'rotate-45 translate-y-[7px]' : 'w-6'}`} />
          <span className={`block h-px bg-cream transition-all duration-300 ${isOpen ? 'opacity-0 w-0' : 'w-4'}`} />
          <span className={`block h-px bg-cream transition-all duration-300 origin-center ${isOpen ? '-rotate-45 -translate-y-[7px]' : 'w-6'}`} />
        </button>
      </div>

      {/* Menu — mobile */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-surface px-6 py-5 flex flex-col gap-5 font-body text-sm font-light tracking-widest uppercase">
          {isAuthenticated ? (
            <>
              <span className="text-muted">Olá, {user?.name?.split(' ')[0]}</span>
              <Link to="/quiz" onClick={close} className="nav-link">Consultora</Link>
              <Link to="/history" onClick={close} className="nav-link">Histórico</Link>
              {isAdmin && (
                <Link to="/admin/produtos" onClick={close} className="nav-link text-gold">Admin</Link>
              )}
              <button onClick={handleLogout} className="btn-nav self-start">Sair</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={close} className="nav-link">Entrar</Link>
              <Link to="/register" onClick={close} className="btn-nav self-start">Cadastrar</Link>
            </>
          )}
        </div>
      )}

      {/* Faixa arco-íris */}
      <div className="rainbow-bar h-0.5 w-full" />
    </nav>
  );
}
