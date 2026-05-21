import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'boutique_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(product, size) {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.size === size);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id && i.size === size
            ? { ...i, quantity: Math.min(i.quantity + 1, 10) }
            : i
        );
      }
      return [...prev, { product, size, quantity: 1 }];
    });
  }

  function removeItem(productId, size) {
    setItems(prev => prev.filter(i => !(i.product.id === productId && i.size === size)));
  }

  function updateQty(productId, size, quantity) {
    if (quantity < 1) return removeItem(productId, size);
    setItems(prev =>
      prev.map(i =>
        i.product.id === productId && i.size === size
          ? { ...i, quantity: Math.min(quantity, 10) }
          : i
      )
    );
  }

  function clearCart() { setItems([]); }

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal  = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, itemCount, subtotal, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
