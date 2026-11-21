import React, { createContext, useContext, useState } from 'react';
import { sendOrderTelegramNotification } from '../services/telegramService';
import { createFirestoreOrder } from '../firebase/services';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [lastPlacedOrder, setLastPlacedOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('tajwatch_last_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Dispatches order to Firebase Firestore and triggers instant Telegram bot notification
   */
  const submitOrder = async (orderPayload) => {
    setIsSubmitting(true);
    const orderId = 'TW-' + Math.floor(100000 + Math.random() * 900000);
    const fullOrder = {
      ...orderPayload,
      orderId,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    try {
      // 1. Save to Firebase Firestore
      await createFirestoreOrder(fullOrder);
    } catch (firebaseErr) {
      console.warn('Firebase order save warning:', firebaseErr);
    }

    try {
      // 2. Save locally for instant client state
      localStorage.setItem('tajwatch_last_order', JSON.stringify(fullOrder));
      setLastPlacedOrder(fullOrder);

      // Save to order history list
      const prevOrders = JSON.parse(localStorage.getItem('tajwatch_order_history') || '[]');
      prevOrders.unshift(fullOrder);
      localStorage.setItem('tajwatch_order_history', JSON.stringify(prevOrders));
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }

    // 3. Trigger instant Telegram dispatch in background without blocking UI
    try {
      await sendOrderTelegramNotification(fullOrder);
    } catch (err) {
      console.error('Telegram dispatch error caught:', err);
    } finally {
      setIsSubmitting(false);
    }

    return fullOrder;
  };

  return (
    <OrderContext.Provider
      value={{
        lastPlacedOrder,
        setLastPlacedOrder,
        isSubmitting,
        submitOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}
