import type {
  User,
  Product,
  ProductPayload,
  QuizAnswers,
  RecommendationResult,
  HistoryEntry,
  FreightResponse,
  Order,
} from '../types';

const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api';

async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
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
    const error = new Error(err.error || 'Erro na requisição') as Error & {
      status?: number;
      details?: unknown;
    };
    error.status = res.status;
    error.details = err.details;
    throw error;
  }

  return res.json();
}

export const register = (name: string, email: string, cpf: string, password: string) =>
  request<{ user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, cpf, password }),
  });

export const login = (email: string, password: string) =>
  request<{ user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const logout = () =>
  request<void>('/auth/logout', { method: 'POST' });

export const getMe = () =>
  request<{ user: User }>('/auth/me');

export const getRecommendations = (answers: QuizAnswers) =>
  request<RecommendationResult>('/recommendations', {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });

export const getHistory = () =>
  request<{ history: HistoryEntry[] }>('/recommendations/history');

export const getProducts = () =>
  request<{ products: Product[] }>('/products');

export const getProduct = (id: number | string) =>
  request<{ product: Product }>(`/products/${id}`);

export const adminListProducts = () =>
  request<{ products: Product[] }>('/admin/products');

export const adminGetProduct = (id: number | string) =>
  request<{ product: Product }>(`/admin/products/${id}`);

export const adminCreateProduct = (data: ProductPayload) =>
  request<{ product: Product }>('/admin/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const adminUpdateProduct = (id: number | string, data: Partial<ProductPayload>) =>
  request<{ product: Product }>(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const adminDeleteProduct = (id: number | string) =>
  request<{ message: string }>(`/admin/products/${id}`, { method: 'DELETE' });

export const adminUploadImage = (file: File, productId?: number | string) => {
  const form = new FormData();
  form.append('image', file);
  if (productId) form.append('productId', String(productId));

  return fetch(`${BASE}/admin/products/upload`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  }).then(async (res) => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erro no upload' }));
      throw new Error(err.error || 'Erro no upload');
    }
    return res.json() as Promise<{ url: string }>;
  });
};

export const adminAddProductImage = (productId: number | string, file: File) => {
  const form = new FormData();
  form.append('image', file);

  return fetch(`${BASE}/admin/products/${productId}/images`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  }).then(async (res) => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erro no upload' }));
      throw new Error(err.error || 'Erro no upload');
    }
    return res.json() as Promise<{ image: { id: number; url: string; position: number } }>;
  });
};

export const adminDeleteProductImage = (productId: number | string, imageId: number) =>
  request<{ message: string }>(`/admin/products/${productId}/images/${imageId}`, { method: 'DELETE' });

export const getFreight = (cep: string, items = 1) =>
  request<FreightResponse>(`/freight?cep=${String(cep).replace(/\D/g, '')}&items=${items}`);

export const createOrder = (data: unknown) =>
  request<{ orderId: number; total: number; shippingFee: number; status: string }>('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getOrders = () =>
  request<{ orders: Order[] }>('/orders');

export const getOrder = (id: number | string) =>
  request<{ order: Order }>(`/orders/${id}`);
