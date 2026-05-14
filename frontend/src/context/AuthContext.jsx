/**
 * context/AuthContext.jsx
 * Estado global de autenticação da aplicação.
 * Expõe: user, isAuthenticated, login(), logout(), isLoading.
 *
 * Por que não salvar o token aqui?
 *   O token JWT vive no cookie HttpOnly gerenciado pelo browser.
 *   O estado React só precisa saber SE o usuário está logado e QUEM é ele.
 *   Isso mantém o token fora do alcance de qualquer código JavaScript.
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getMe, logout as apiLogout } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ao montar o provider, tentar restaurar a sessão verificando o cookie existente.
  // Isso garante que o usuário continue logado após recarregar a página.
  useEffect(() => {
    getMe()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  // Chamado após login/registro bem-sucedido — o token já está no cookie
  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  // Chama a API para limpar o cookie HttpOnly no servidor, depois limpa o estado
  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = {
    user,
    isAuthenticated: user !== null,
    isAdmin: user?.isAdmin === true,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
