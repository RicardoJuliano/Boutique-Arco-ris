/**
 * hooks/useAuth.ts
 * Hook conveniente para acessar o AuthContext em qualquer componente.
 * Lança erro se usado fora do AuthProvider — falha rápido com mensagem clara.
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return context;
}
