import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const SESSION_KEY = 'dinevo_session_v2';
const CART_KEY = 'dinevo_cart_v2';

export function CartProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
    } catch {
      return null;
    }
  });

  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const startSession = (sessionData) => {
    setSession({
      sessionCode: sessionData.sessionCode || 'D4821',
      tableNumber: sessionData.tableNumber || '08',
      tableCode: sessionData.tableCode || 'DINEVO-T08',
      restaurantId: sessionData.restaurantId,
      restaurantName: sessionData.restaurantName || 'DINEVO Kitchen',
      tagline: sessionData.tagline || 'Crafted Dining',
      verified: true
    });
  };

  const addItem = (menuItem, quantity = 1, customization = {}) => {
    const { spiceLevel = 'Medium', selectedAddOns = [], notes = '' } = customization;

    setItems((prev) => {
      const addOnsKey = selectedAddOns
        .map((a) => a.name)
        .sort()
        .join('|');
      const itemKey = `${menuItem._id}_${spiceLevel}_${addOnsKey}_${notes}`;

      const existingIndex = prev.findIndex((i) => i.itemKey === itemKey);

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity
        };
        return next;
      }

      const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + Number(a.price || 0), 0);
      const unitPrice = Number(menuItem.price) + addOnsTotal;

      return [
        ...prev,
        {
          itemKey,
          menuItem: menuItem._id,
          name: menuItem.name,
          basePrice: menuItem.price,
          price: unitPrice,
          image: menuItem.image,
          quantity,
          spiceLevel,
          selectedAddOns,
          notes
        }
      ];
    });
  };

  const updateQuantity = (itemKey, delta) => {
    setItems((prev) =>
      prev
        .map((i) => (i.itemKey === itemKey ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (itemKey) => {
    setItems((prev) => prev.filter((i) => i.itemKey !== itemKey));
  };

  const clearCart = () => setItems([]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    return { subtotal, tax, total, count };
  }, [items]);

  const value = {
    session,
    startSession,
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totals
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
