/**
 * components/PrivateRoute.jsx
 * Componente wrapper para rotas protegidas.
 * Enquanto o estado de auth está carregando (verificando cookie), exibe loading.
 * Se não autenticado, redireciona para /login preservando a URL de destino.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from './Spinner';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    // state.from permite redirecionar de volta após login bem-sucedido
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
