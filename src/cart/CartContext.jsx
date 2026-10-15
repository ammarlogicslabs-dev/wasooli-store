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
    const requested = Math.max(1, Number(quantity) || 1);
    const stock = Number.isFinite(product.stock) ? product.stock : null;

    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      const currentQty = existing?.quantity ?? 0;
      const nextQty =
        stock === null
          ? currentQty + requested
          : Math.min(stock, currentQty + requested);

      if (nextQty <= 0) return current;

      const next = existing
        ? current.map((item) =>
            item.id === product.id
              ? { ...item, quantity: nextQty, stock }
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
              stock,
              quantity: nextQty,
            },
          ];

      localStorage.setItem("wasooli_cart", JSON.stringify(next));
      return next;
    });
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    setItems((current) => {
      const next = current.flatMap((item) => {
        if (item.id !== id) return [item];
        const stock = Number.isFinite(item.stock) ? item.stock : null;
        const nextQty = Math.max(1, Number(quantity) || 1);
        const capped = stock === null ? nextQty : Math.min(stock, nextQty);
        return [{ ...item, quantity: capped }];
      });
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

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.setItem("wasooli_cart", "[]");
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

  const isWished = useCallback((id) => wishlist.includes(id), [wishlist]);

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  const value = useMemo(
    () => ({
      items,
      cartCount,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      wishlist,
      isWished,
      toggleWishlist,
    }),
    [
      items,
      cartCount,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      wishlist,
      isWished,
      toggleWishlist,
    ]
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
