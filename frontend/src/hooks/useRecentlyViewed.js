import { useEffect } from 'react';

const KEY = 'boutique_recently_viewed';
const MAX = 6;

export function useRecentlyViewed(product) {
  useEffect(() => {
    if (!product?.id) return;
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || '[]');
      const filtered = stored.filter((p) => p.id !== product.id);
      localStorage.setItem(KEY, JSON.stringify([product, ...filtered].slice(0, MAX)));
    } catch {}
  }, [product?.id]);
}

export function getRecentlyViewed(excludeId) {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]').filter((p) => p.id !== excludeId);
  } catch {
    return [];
  }
}
