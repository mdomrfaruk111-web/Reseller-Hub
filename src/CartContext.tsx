import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, OrderItem } from '../types';
import { DEFAULT_STORE_SETTINGS } from '../data/initialData';

export interface CartItem extends OrderItem {
  stock: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, resellerPrice?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryLocation: 'inside_dhaka' | 'outside_dhaka';
  setDeliveryLocation: (location: 'inside_dhaka' | 'outside_dhaka') => void;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  applyCoupon: (code: string) => boolean;
  couponCode: string;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('nexshop_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [deliveryLocation, setDeliveryLocation] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [couponCode, setCouponCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('nexshop_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [cart]);

  const addToCart = (product: Product, quantity: number = 1, resellerPrice?: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock);
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          productImage: product.images?.[0] || '',
          price: product.price,
          resellerPrice: resellerPrice || product.resellerPrice,
          quantity: Math.min(quantity, product.stock),
          stock: product.stock,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          return { ...item, quantity: Math.min(quantity, item.stock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setDiscount(0);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const baseDeliveryFee = deliveryLocation === 'inside_dhaka'
    ? DEFAULT_STORE_SETTINGS.deliveryFeeInside
    : DEFAULT_STORE_SETTINGS.deliveryFeeOutside;

  const shippingFee = (subtotal >= DEFAULT_STORE_SETTINGS.freeShippingThreshold || subtotal === 0)
    ? 0
    : baseDeliveryFee;

  const totalAmount = Math.max(0, subtotal + shippingFee - discount);

  const applyCoupon = (code: string): boolean => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'NEX100' && subtotal >= 1000) {
      setCouponCode(cleanCode);
      setDiscount(100);
      return true;
    } else if (cleanCode === 'RESELLERVIP' && subtotal >= 2000) {
      setCouponCode(cleanCode);
      setDiscount(200);
      return true;
    }
    return false;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        deliveryLocation,
        setDeliveryLocation,
        shippingFee,
        discount,
        totalAmount,
        applyCoupon,
        couponCode,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
