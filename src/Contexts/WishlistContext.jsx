
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext(null);

const load = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => load("fk_wishlist"));

  useEffect(() => {
    localStorage.setItem("fk_wishlist", JSON.stringify(items));
  }, [items]);

  const toggle = (product) =>
    setItems((prev) =>
      prev.some((i) => i._id === product._id)
        ? prev.filter((i) => i._id !== product._id)
        : [...prev, product]
    );

  const has = (id) => items.some((i) => i._id === id);

  const remove = (id) =>
    setItems((prev) => prev.filter((i) => i._id !== id));

  return (
    <WishlistContext.Provider value={{ items, toggle, has, remove }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
