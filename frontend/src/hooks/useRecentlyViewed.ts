import { useEffect } from 'react';
import type { Product } from '../types';

const KEY = 'boutique_recently_viewed';
const MAX = 6;

export function useRecentlyViewed(product: Product | null) {
  useEffect(() => {
    if (!product?.id) return;
    try {
      const stored: Product[] = JSON.parse(localStorage.getItem(KEY) || '[]');
      const filtered = stored.filter((p) => p.id !== product.id);
      localStorage.setItem(KEY, JSON.stringify([product, ...filtered].slice(0, MAX)));
    } catch {}
  }, [product?.id]);
}

export function getRecentlyViewed(excludeId: number): Product[] {
  try {
    const stored: Product[] = JSON.parse(localStorage.getItem(KEY) || '[]');
    return stored.filter((p) => p.id !== excludeId);
  } catch {
    return [];
  }
}
