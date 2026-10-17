import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { products as baseProducts } from "../data/product";

const CartContext = createContext(null);
const STOCK_KEY = "wasooli_stock";
const BASE_STOCK_KEY = "wasooli_base_stock";
const NOTIFICATIONS_KEY = "wasooli_notifications";

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function readWishlist() {
  const saved = readStorage("wasooli_wishlist", []);
  if (!Array.isArray(saved)) return [];

  return saved
    .map((entry) => {
      if (typeof entry === "number" || typeof entry === "string") {
        return { id: Number(entry), addedAt: null };
      }
      if (entry && entry.id != null) {
        return { id: Number(entry.id), addedAt: entry.addedAt ?? null };
      }
      return null;
    })
    .filter((entry) => entry && Number.isFinite(entry.id));
}

function readNotifications() {
  try {
    const seeded = localStorage.getItem("wasooli_notifications_seeded");
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(existing) ? existing : [];

    if (!seeded) {
      localStorage.setItem("wasooli_notifications_seeded", "1");
      const restocked = baseProducts.find((item) => item.id === 3 && item.stock > 0);
      if (restocked && !list.some((n) => n.productId === restocked.id)) {
        const initial = [
          {
            id: `notif-${restocked.id}-init`,
            productId: restocked.id,
            slug: restocked.slug,
            title: restocked.title,
            image: restocked.image,
            type: "in_stock",
            message: `${restocked.title} is now available in stock (${restocked.stock} items available).`,
            createdAt: new Date().toISOString(),
            read: false,
          },
          ...list,
        ];
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(initial));
        return initial;
      }
    }
    return list;
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readStorage("wasooli_cart", []));
  const [wishlist, setWishlist] = useState(readWishlist);
  const [notifications, setNotifications] = useState(readNotifications);
  const [stockMap, setStockMap] = useState(() => {
    const savedOverride = readStorage(STOCK_KEY, {});
    const savedBase = readStorage(BASE_STOCK_KEY, {});
    const nextOverride = { ...savedOverride };
    const nextBase = {};
    const newNotifications = [];

    baseProducts.forEach((product) => {
      const prevBaseStock = savedBase[product.id];
      nextBase[product.id] = product.stock;

      if (prevBaseStock !== undefined && prevBaseStock !== product.stock) {
        delete nextOverride[product.id];

        if (product.stock > prevBaseStock && product.stock > 0) {
          newNotifications.push({
            id: `notif-${product.id}-${Date.now()}`,
            productId: product.id,
            slug: product.slug,
            title: product.title,
            image: product.image,
            type: "in_stock",
            message: `${product.title} is now available in stock (${product.stock} items available).`,
            createdAt: new Date().toISOString(),
            read: false,
          });
        } else if (prevBaseStock > 0 && product.stock <= 0) {
          const currentWishlist = readWishlist();
          if (currentWishlist.some((entry) => entry.id === product.id)) {
            newNotifications.push({
              id: `notif-${product.id}-${Date.now()}`,
              productId: product.id,
              slug: product.slug,
              title: product.title,
              image: product.image,
              type: "out_of_stock",
              message: `${product.title} from your wishlist is now out of stock.`,
              createdAt: new Date().toISOString(),
              read: false,
            });
          }
        }
      }
    });

    if (newNotifications.length > 0) {
      const existing = readNotifications();
      const updated = [...newNotifications, ...existing];
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    }

    localStorage.setItem(BASE_STOCK_KEY, JSON.stringify(nextBase));
    localStorage.setItem(STOCK_KEY, JSON.stringify(nextOverride));
    return nextOverride;
  });
  const cartListeners = useRef(new Set());

  const baseStockSignature = baseProducts
    .map((product) => `${product.id}:${product.stock}`)
    .join(",");

  const products = useMemo(
    () =>
      baseProducts.map((product) => {
        const override = stockMap[product.id];
        return Number.isFinite(override)
          ? { ...product, stock: Math.max(0, override) }
          : product;
      }),
    [stockMap, baseStockSignature]
  );

  useEffect(() => {
    setNotifications(readNotifications());
  }, [baseStockSignature]);

  useEffect(() => {
    const savedBase = readStorage(BASE_STOCK_KEY, {});
    let stockChanged = false;
    const nextBase = { ...savedBase };
    const nextOverride = { ...readStorage(STOCK_KEY, {}) };
    const newNotifications = [];
    const currentWishlist = readWishlist();

    baseProducts.forEach((product) => {
      const prevBaseStock = savedBase[product.id];
      if (prevBaseStock !== product.stock) {
        nextBase[product.id] = product.stock;
        if (prevBaseStock !== undefined) {
          delete nextOverride[product.id];
          stockChanged = true;

          if (product.stock > prevBaseStock && product.stock > 0) {
            newNotifications.push({
              id: `notif-${product.id}-${Date.now()}`,
              productId: product.id,
              slug: product.slug,
              title: product.title,
              image: product.image,
              type: "in_stock",
              message: `${product.title} is now available in stock (${product.stock} items available).`,
              createdAt: new Date().toISOString(),
              read: false,
            });
          } else if (
            prevBaseStock > 0 &&
            product.stock <= 0 &&
            currentWishlist.some((entry) => entry.id === product.id)
          ) {
            newNotifications.push({
              id: `notif-${product.id}-${Date.now()}`,
              productId: product.id,
              slug: product.slug,
              title: product.title,
              image: product.image,
              type: "out_of_stock",
              message: `${product.title} from your wishlist is now out of stock.`,
              createdAt: new Date().toISOString(),
              read: false,
            });
          }
        }
      }
    });

    localStorage.setItem(BASE_STOCK_KEY, JSON.stringify(nextBase));
    if (stockChanged) {
      localStorage.setItem(STOCK_KEY, JSON.stringify(nextOverride));
      setStockMap(nextOverride);
    }
    if (newNotifications.length > 0) {
      setNotifications((current) => {
        const filtered = current.filter(
          (existing) => !newNotifications.some((n) => n.productId === existing.productId && n.type === existing.type)
        );
        const updated = [...newNotifications, ...filtered];
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [baseStockSignature]);

  useEffect(() => {
    function handleStorage(event) {
      if (event.key === STOCK_KEY) {
        setStockMap(readStorage(STOCK_KEY, {}));
      } else if (event.key === NOTIFICATIONS_KEY) {
        setNotifications(readNotifications());
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const deductStock = useCallback((orderedItems) => {
    if (!Array.isArray(orderedItems) || orderedItems.length === 0) return;

    const currentWishlist = readWishlist();
    const wishedIds = new Set(currentWishlist.map((entry) => entry.id));
    const newNotifications = [];

    setStockMap((current) => {
      const next = { ...current };
      orderedItems.forEach((entry) => {
        const base = baseProducts.find((item) => item.id === entry.id);
        const currentStock = Number.isFinite(next[entry.id])
          ? next[entry.id]
          : Number.isFinite(base?.stock)
          ? base.stock
          : null;

        if (currentStock !== null) {
          const qty = Math.max(0, Number(entry.quantity) || 0);
          const updatedStock = Math.max(0, currentStock - qty);
          next[entry.id] = updatedStock;

          if (wishedIds.has(entry.id) && base && currentStock > 0 && updatedStock === 0) {
            newNotifications.push({
              id: `notif-${base.id}-${Date.now()}`,
              productId: base.id,
              slug: base.slug,
              title: base.title,
              image: base.image,
              type: "out_of_stock",
              message: `${base.title} from your wishlist is now out of stock.`,
              createdAt: new Date().toISOString(),
              read: false,
            });
          }
        }
      });

      localStorage.setItem(STOCK_KEY, JSON.stringify(next));

      setItems((cartItems) => {
        const updatedCart = cartItems.flatMap((cartItem) => {
          const updatedStock = next[cartItem.id];
          if (!Number.isFinite(updatedStock)) return [cartItem];
          if (updatedStock <= 0) return [];
          return [
            {
              ...cartItem,
              stock: updatedStock,
              quantity: Math.min(cartItem.quantity, updatedStock),
            },
          ];
        });
        localStorage.setItem("wasooli_cart", JSON.stringify(updatedCart));
        return updatedCart;
      });

      return next;
    });

    if (newNotifications.length > 0) {
      setNotifications((current) => {
        const updated = [...newNotifications, ...current];
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, []);

  const openCart = useCallback(() => {
    cartListeners.current.forEach((listener) => listener());
  }, []);

  const subscribeCartOpen = useCallback((listener) => {
    cartListeners.current.add(listener);
    return () => cartListeners.current.delete(listener);
  }, []);

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
    const productId = Number(id);
    setWishlist((current) => {
      const exists = current.some((entry) => entry.id === productId);
      const next = exists
        ? current.filter((entry) => entry.id !== productId)
        : [
            ...current,
            { id: productId, addedAt: new Date().toISOString() },
          ];
      localStorage.setItem("wasooli_wishlist", JSON.stringify(next));
      return next;
    });
  }, []);

  const isWished = useCallback(
    (id) => wishlist.some((entry) => entry.id === Number(id)),
    [wishlist]
  );

  const markNotificationsRead = useCallback(() => {
    setNotifications((current) => {
      if (!current.some((item) => !item.read)) return current;
      const next = current.map((item) => (item.read ? item : { ...item, read: true }));
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((current) => {
      const next = current.filter((item) => item.id !== id);
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.setItem(NOTIFICATIONS_KEY, "[]");
  }, []);

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);
  const notificationCount = notifications.filter((item) => !item.read).length;

  const value = useMemo(
    () => ({
      products,
      items,
      cartCount,
      addItem,
      openCart,
      subscribeCartOpen,
      updateQuantity,
      removeItem,
      clearCart,
      deductStock,
      wishlist,
      isWished,
      toggleWishlist,
      notifications,
      notificationCount,
      markNotificationsRead,
      removeNotification,
      clearNotifications,
    }),
    [
      products,
      items,
      cartCount,
      addItem,
      openCart,
      subscribeCartOpen,
      updateQuantity,
      removeItem,
      clearCart,
      deductStock,
      wishlist,
      isWished,
      toggleWishlist,
      notifications,
      notificationCount,
      markNotificationsRead,
      removeNotification,
      clearNotifications,
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
