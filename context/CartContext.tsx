"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("omkkaar_cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("omkkaar_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((c) => c.id !== id));

  const updateQty = (id: string, qty: number) =>
    setCart((prev) =>
      qty <= 0
        ? prev.filter((c) => c.id !== id)
        : prev.map((c) => (c.id === id ? { ...c, quantity: qty } : c))
    );

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQty, clearCart, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
