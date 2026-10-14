import { createContext, useCallback, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readStorage("wasooli_cart", []));
  const [wishlist, setWishlist] = useState(() =>
    readStorage("wasooli_wishlist", [])
  );

  const addItem = useCallback((product, quantity = 1) => {
    const nextQty = Math.max(1, Number(quantity) || 1);
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      const next = existing
        ? current.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + nextQty }
              : item
          )
        : [
            ...current,
            {
              id: product.id,
              slug: product.slug,
              title: product.title,
              image: product.image,
              price: product.price,
              quantity: nextQty,
            },
          ];
      localStorage.setItem("wasooli_cart", JSON.stringify(next));
      return next;
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((current) => {
      const next = current.filter((item) => item.id !== id);
      localStorage.setItem("wasooli_cart", JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleWishlist = useCallback((id) => {
    setWishlist((current) => {
      const next = current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id];
      localStorage.setItem("wasooli_wishlist", JSON.stringify(next));
      return next;
    });
  }, []);

  const isWished = useCallback(
    (id) => wishlist.includes(id),
    [wishlist]
  );

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  const value = useMemo(
    () => ({
      items,
      cartCount,
      addItem,
      removeItem,
      wishlist,
      isWished,
      toggleWishlist,
    }),
    [items, cartCount, addItem, removeItem, wishlist, isWished, toggleWishlist]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
