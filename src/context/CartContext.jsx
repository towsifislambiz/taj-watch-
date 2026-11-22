import React, { createContext, useContext, useState, useEffect } from 'react';
import { STORE_SETTINGS } from '../data/products';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('tajwatch_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [deliveryZone, setDeliveryZone] = useState('inside_dhaka'); // 'inside_dhaka' | 'outside_dhaka'
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickOrderProduct, setQuickOrderProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('tajwatch_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const addToCart = (product, quantity = 1, selectedColor = null) => {
    const colorChoice = selectedColor || (product.colors && product.colors[0]?.name) || null;
    const cartItemId = `${product.id}-${colorChoice || 'default'}`;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prev,
          {
            ...product,
            cartItemId,
            quantity,
            selectedColor: colorChoice,
          },
        ];
      }
    });

    showToast(`"${product.nameBn || product.name}" কার্টে যুক্ত হয়েছে!`);
  };

  const removeFromCart = (cartItemId) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Direct 1-Click Fast Checkout Modal Trigger
  const triggerOneClickOrder = (product, selectedColor = null) => {
    const color = selectedColor || (product.colors && product.colors[0]?.name) || null;
    setQuickOrderProduct({
      ...product,
      selectedColor: color,
      quantity: 1,
    });
  };

  const closeOneClickOrder = () => {
    setQuickOrderProduct(null);
  };

  // Pricing calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const deliveryFee =
    deliveryZone === 'outside_dhaka'
      ? STORE_SETTINGS.deliveryOutsideDhaka
      : STORE_SETTINGS.deliveryInsideDhaka;
  const grandTotal = subtotal > 0 ? subtotal + deliveryFee : 0;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemCount,
        subtotal,
        deliveryZone,
        setDeliveryZone,
        deliveryFee,
        grandTotal,
        isCartOpen,
        setIsCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        quickOrderProduct,
        triggerOneClickOrder,
        closeOneClickOrder,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toastMessage,
      }}
    >
      {children}
      {/* Global Toast Pill (Smooth, lightweight, zero GPU lag) */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2.5 bg-slate-900/95 border border-amber-500/40 text-white px-4 py-2.5 rounded-xl shadow-xl transition-all pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
