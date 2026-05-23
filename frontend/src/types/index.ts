export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

// ─── Produto ───────────────────────────────────────────────────────────────

export type ProductStyle     = 'clássico' | 'moderno' | 'streetwear' | 'boho' | 'minimalista';
export type ProductColor     = 'neutros' | 'tons quentes' | 'tons frios' | 'colorido';
export type ProductOccasion  = 'trabalho' | 'festa' | 'casual' | 'passeio' | 'esporte';
export type ProductCategory  = 'camiseta' | 'calça' | 'vestido' | 'jaqueta' | 'conjunto';
export type ProductSize      = 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XG' | '34' | '36' | '38' | '40' | '42' | '44' | '46' | 'U';

export interface Product {
  id: number;
  name: string;
  price: number;
  category: ProductCategory;
  style: ProductStyle[];
  colors: ProductColor[];
  occasions: ProductOccasion[];
  sizes: ProductSize[];
  desc: string;
  tag?: string;
  image_url?: string;
  stock: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Carrinho ──────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  size: ProductSize;
  quantity: number;
}

// ─── Quiz / Recomendações ──────────────────────────────────────────────────

export interface QuizAnswers {
  occasion: string;
  style: string;
  colors: string[];
  size: ProductSize;
  budget: string;
  category: string;
}

export interface Recommendation {
  id: number;
  reason: string;
  product: Product | null;
}

export interface RecommendationResult {
  message: string;
  recommendations: Recommendation[];
}

export interface HistoryEntry {
  id: number;
  created_at: string;
  answers: Record<string, unknown>;
  result: RecommendationResult;
}

// ─── Pedidos ───────────────────────────────────────────────────────────────

export interface OrderAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  district?: string;
  complement?: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  image_url?: string;
  size: ProductSize;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: number;
  status: string;
  total: number;
  shipping_fee: number;
  address: OrderAddress;
  shipping_method: string;
  payment_method: string;
  created_at: string;
  items: OrderItem[];
}

// ─── Frete ─────────────────────────────────────────────────────────────────

export interface FreightShippingOption {
  price: number;
  days: number;
  label: string;
  code?: string;
}

export interface FreightResponse {
  shipping: {
    pac: FreightShippingOption;
    sedex: FreightShippingOption;
  };
  address: {
    street: string;
    district: string;
    city: string;
    state: string;
    zip: string;
  };
}

// ─── Erro de API ───────────────────────────────────────────────────────────

export interface ApiError extends Error {
  status?: number;
  details?: unknown;
}