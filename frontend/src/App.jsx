/**
 * App.jsx
 * Define a árvore de rotas da aplicação com React Router v6.
 * O AuthProvider envolve tudo — garante que qualquer componente acesse useAuth().
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import ProductFormPage from './pages/admin/ProductFormPage';
import CatalogoPage from './pages/CatalogoPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rotas protegidas — exigem autenticação */}
          <Route
            path="/quiz"
            element={
              <PrivateRoute>
                <QuizPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/results"
            element={
              <PrivateRoute>
                <ResultsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/history"
            element={
              <PrivateRoute>
                <HistoryPage />
              </PrivateRoute>
            }
          />

          {/* Rotas de admin — exigem isAdmin */}
          <Route
            path="/admin/produtos"
            element={
              <AdminRoute>
                <AdminProductsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/produtos/:id"
            element={
              <AdminRoute>
                <ProductFormPage />
              </AdminRoute>
            }
          />

          {/* Qualquer rota desconhecida redireciona para home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
