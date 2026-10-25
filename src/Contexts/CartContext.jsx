
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { deliveryFreeAt } from "../utils/data";

const CartContext = createContext(null);

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => load("fk_cart", []));

  useEffect(() => {
    localStorage.setItem("fk_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1, size = "Free Size") => {
    setItems((prev) => {
      const found = prev.find(
        (i) => i.product._id === product._id && i.size === size
      );
      if (found) {
        return prev.map((i) =>
          i === found ? { ...i, qty: Math.min(i.qty + qty, 10) } : i
        );
      }
      return [...prev, { product, qty, size }];
    });
  };

  const removeItem = (productId, size) =>
    setItems((prev) =>
      prev.filter(
        (i) => !(i.product._id === productId && i.size === size)
      )
    );

  const setQty = (productId, size, qty) =>
    setItems((prev) =>
      prev.map((i) =>
        i.product._id === productId && i.size === size
          ? { ...i, qty: Math.max(1, Math.min(qty, 10)) }
          : i
      )
    );

  const clearCart = () => setItems([]);

  const count = items.reduce((sum, i) => sum + i.qty, 0);

  const totalPrice = items.reduce(
    (sum, i) => sum + i.product.price * i.qty,
    0
  );

  const totalMrp = items.reduce(
    (sum, i) => sum + (i.product.mrp || i.product.price) * i.qty,
    0
  );

  const discount = totalMrp - totalPrice;

  // Flipkart-style: ₹40 delivery fee, free above ₹499 (or empty cart)
  const delivery =
    items.length === 0 || totalPrice >= deliveryFreeAt ? 0 : 40;

  const total = totalPrice + delivery;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        setQty,
        clearCart,
        count,
        totalPrice,
        totalMrp,
        discount,
        delivery,
        total,
      }}
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
