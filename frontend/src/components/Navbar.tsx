import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="11" cy="11" r="8" />
      <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function IconBag() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function CartBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="bg-gold text-bg text-[10px] font-body font-light w-4 h-4 rounded-full flex items-center justify-center leading-none">
      {count > 9 ? '9+' : count}
    </span>
  );
}

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const lastY = useRef(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  function close() { setIsOpen(false); }

  function openSearch() {
    setSearchOpen(true);
    setIsOpen(false);
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery('');
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/catalogo?q=${encodeURIComponent(searchQuery.trim())}`);
    closeSearch();
  }

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
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" onClick={close} className="shrink-0 hover:opacity-80 transition-opacity duration-300">
          <img src="/logo.png" alt="Boutique Arco-Íris" className="h-16 w-auto object-contain" />
        </Link>

        {/* Search form — replaces nav when active */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-3">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar produtos..."
              className="flex-1 bg-transparent border-b border-gold text-cream font-body font-light text-sm py-1 outline-none placeholder:text-muted/50"
            />
            <button type="submit" className="text-gold hover:text-cream transition-colors shrink-0" aria-label="Buscar">
              <IconSearch />
            </button>
            <button
              type="button"
              onClick={closeSearch}
              className="text-muted hover:text-cream transition-colors text-base leading-none shrink-0"
              aria-label="Fechar busca"
            >
              ✕
            </button>
          </form>
        )}

        {/* Desktop nav — hidden when search is open */}
        {!searchOpen && (
          <div className="hidden md:flex items-center gap-6 font-body text-sm font-light tracking-widest uppercase">
            <Link to="/catalogo" className="nav-link">Catálogo</Link>

            <button
              onClick={openSearch}
              className="text-muted hover:text-gold transition-colors duration-200"
              aria-label="Abrir busca"
            >
              <IconSearch />
            </button>

            <Link
              to="/carrinho"
              className="relative text-muted hover:text-gold transition-colors duration-200"
              aria-label={`Carrinho${itemCount > 0 ? `, ${itemCount} itens` : ''}`}
            >
              <IconBag />
              <span className="absolute -top-2 -right-2">
                <CartBadge count={itemCount} />
              </span>
            </Link>

            {isAuthenticated ? (
              <>
                <span className="text-muted text-xs normal-case tracking-normal">Olá, {user?.name?.split(' ')[0]}</span>
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
        )}

        {/* Mobile: search icon + hamburger */}
        {!searchOpen && (
          <div className="md:hidden flex items-center gap-3">
            <button onClick={openSearch} className="text-muted hover:text-gold transition-colors" aria-label="Abrir busca">
              <IconSearch />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex flex-col justify-center gap-[5px] w-8 h-8"
              aria-label="Menu"
            >
              <span className={`block h-px bg-cream transition-all duration-300 origin-center ${isOpen ? 'rotate-45 translate-y-[7px] w-6' : 'w-6'}`} />
              <span className={`block h-px bg-cream transition-all duration-300 ${isOpen ? 'opacity-0 w-0' : 'w-4'}`} />
              <span className={`block h-px bg-cream transition-all duration-300 origin-center ${isOpen ? '-rotate-45 -translate-y-[7px] w-6' : 'w-6'}`} />
            </button>
          </div>
        )}
      </div>

      {/* Mobile dropdown menu */}
      <div
        className={`md:hidden border-border bg-surface/95 backdrop-blur-md px-6 flex flex-col gap-5
          font-body text-sm font-light tracking-widest uppercase overflow-hidden
          transition-all duration-350 ease-in-out
          ${isOpen ? 'max-h-96 py-5 border-t opacity-100' : 'max-h-0 py-0 opacity-0'}`}
      >
        <Link to="/catalogo" onClick={close} className="nav-link">Catálogo</Link>
        <Link to="/carrinho" onClick={close} className="nav-link flex items-center gap-2">
          Carrinho
          <CartBadge count={itemCount} />
        </Link>
        {isAuthenticated ? (
          <>
            <span className="text-muted normal-case tracking-normal">Olá, {user?.name?.split(' ')[0]}</span>
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
