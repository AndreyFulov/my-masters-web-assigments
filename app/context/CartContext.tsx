"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from '../utils/api';
import { trackAction } from '../utils/tracker';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('shop_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (_) {}
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('shop_cart', JSON.stringify(cart));
    }
  }, [cart, isHydrated]);

  const addToCart = (product: Product, quantity = 1) => {
    trackAction('add_to_cart', {
    product_id: product.ID,
    product_name: product.name,
    price: product.price,
    quantity,
  });
    setCart((prev) => {
      const existing = prev.find((item) => item.product.ID === product.ID);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock);
        return prev.map((item) =>
          item.product.ID === product.ID ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
    });
  };

  const removeFromCart = (productId: number) => {
    const item = cart.find((i) => i.product.ID === productId);
    trackAction('remove_from_cart', {
    product_id: productId,
    product_name: item?.product.name,
    quantity_removed: item?.quantity,
  });
    setCart((prev) => prev.filter((item) => item.product.ID !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.ID === productId) {
          return { ...item, quantity: Math.min(quantity, item.product.stock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};