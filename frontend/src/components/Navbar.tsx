import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      if (y > lastY.current && y > 110) setHidden(true);
      else if (y < lastY.current) setHidden(false);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function close() { setIsOpen(false); }

  async function handleLogout() {
    await logout();
    navigate('/');
    close();
  }

  return (
    <nav
      className={`sticky top-0 z-50 border-b transition-all duration-400
        ${hidden ? '-translate-y-full' : 'translate-y-0'}
        ${scrolled
          ? 'bg-surface/95 backdrop-blur-md border-border shadow-[0_1px_16px_rgba(44,36,32,0.07)]'
          : 'bg-surface border-border'
        }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" onClick={close} className="flex flex-col items-center leading-none hover:opacity-75 transition-opacity duration-300">
          <span className="font-script text-[2.8rem] text-cream leading-[1] select-none">
            Arco-Íris
          </span>
          <span className="font-cormorant text-[0.6rem] font-light tracking-[0.55em] uppercase text-muted select-none">
            Boutique
          </span>
        </Link>

        {/* Links — desktop */}
        <div className="hidden md:flex items-center gap-6 font-body text-sm font-light tracking-widest uppercase">
          <Link to="/catalogo" className="nav-link">Catálogo</Link>
          <Link to="/carrinho" className="relative nav-link">
            <span>Carrinho</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-gold text-bg text-[10px] font-body font-light w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <>
              <span className="text-muted text-xs">Olá, {user?.name?.split(' ')[0]}</span>
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
          <span className={`block h-px bg-cream transition-all duration-300 origin-center ${isOpen ? 'rotate-45 translate-y-[7px] w-6' : 'w-6'}`} />
          <span className={`block h-px bg-cream transition-all duration-300 ${isOpen ? 'opacity-0 w-0' : 'w-4'}`} />
          <span className={`block h-px bg-cream transition-all duration-300 origin-center ${isOpen ? '-rotate-45 -translate-y-[7px] w-6' : 'w-6'}`} />
        </button>
      </div>

      {/* Menu mobile — slide com max-height */}
      <div
        className={`md:hidden border-border bg-surface/95 backdrop-blur-md px-6 flex flex-col gap-5
          font-body text-sm font-light tracking-widest uppercase overflow-hidden
          transition-all duration-350 ease-in-out
          ${isOpen ? 'max-h-96 py-5 border-t opacity-100' : 'max-h-0 py-0 opacity-0'}`}
      >
        <Link to="/catalogo" onClick={close} className="nav-link">Catálogo</Link>
        <Link to="/carrinho" onClick={close} className="nav-link flex items-center gap-2">
          Carrinho {itemCount > 0 && <span className="bg-gold text-bg text-[10px] font-body w-4 h-4 rounded-full flex items-center justify-center">{itemCount > 9 ? '9+' : itemCount}</span>}
        </Link>
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

      {/* Faixa arco-íris */}
      <div className="rainbow-bar h-[3px] w-full" />
    </nav>
  );
}
