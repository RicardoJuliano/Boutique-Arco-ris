export function formatPrice(price: number): string {
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
}

export function toErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Erro';
}
