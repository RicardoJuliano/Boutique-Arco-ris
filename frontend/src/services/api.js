/**
 * services/api.js
 * Centraliza todas as chamadas fetch à API.
 * credentials: 'include' é obrigatório em todas as requisições para que o
 * browser envie automaticamente o cookie HttpOnly com o JWT.
 *
 * Por que não usar Axios?
 *   O fetch nativo resolve tudo sem dependência extra. Para este projeto,
 *   a simplicidade supera os utilitários extras do Axios.
 */

const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
    const error = new Error(err.error || 'Erro na requisição');
    error.status = res.status;
    error.details = err.details;
    throw error;
  }

  return res.json();
}

export const register = (name, email, password) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

export const login = (email, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const logout = () =>
  request('/auth/logout', { method: 'POST' });

export const getMe = () =>
  request('/auth/me');

export const getRecommendations = (answers) =>
  request('/recommendations', {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });

export const getHistory = () =>
  request('/recommendations/history');

export const getProducts = () => request('/products');

export const getProduct = (id) => request(`/products/${id}`);

// Admin
export const adminListProducts = () =>
  request('/admin/products');

export const adminGetProduct = (id) =>
  request(`/admin/products/${id}`);

export const adminCreateProduct = (data) =>
  request('/admin/products', { method: 'POST', body: JSON.stringify(data) });

export const adminUpdateProduct = (id, data) =>
  request(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const adminDeleteProduct = (id) =>
  request(`/admin/products/${id}`, { method: 'DELETE' });

export const adminUploadImage = (file, productId) => {
  const form = new FormData();
  form.append('image', file);
  if (productId) form.append('productId', productId);
  return fetch('/api/admin/products/upload', {
    method: 'POST',
    credentials: 'include',
    body: form,
  }).then(async (res) => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erro no upload' }));
      throw new Error(err.error || 'Erro no upload');
    }
    return res.json();
  });
};
