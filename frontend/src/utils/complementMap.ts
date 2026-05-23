import type { Product, ProductCategory } from '../types';

const COMPLEMENTS: Record<ProductCategory, ProductCategory[]> = {
  vestido:  ['jaqueta', 'camiseta'],
  conjunto: ['jaqueta', 'calça'],
  jaqueta:  ['calça', 'camiseta'],
  calça:    ['camiseta', 'jaqueta'],
  camiseta: ['calça', 'vestido'],
};

export function getComplements(
  category: ProductCategory,
  allProducts: Product[],
  currentId: number
): Product[] {
  const cats = COMPLEMENTS[category] || [];
  return allProducts
    .filter((p) => cats.includes(p.category) && p.id !== currentId)
    .slice(0, 4);
}
