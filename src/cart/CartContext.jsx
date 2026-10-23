import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useLoginPrompt } from "../auth/LoginPromptContext";
import {
  addWishlistApi,
  clearCartApi,
  fetchCartApi,
  fetchNotificationsApi,
  fetchWishlistApi,
  getStorefrontProducts,
  markAllNotificationsReadApi,
  refreshStorefrontProducts,
  removeWishlistApi,
  replaceCartApi,
} from "../services/storage/adminDataService";
import { DATA_EVENT } from "../services/storage/storageService";
import { getToken } from "../services/api/client";
import { getUnitPrice, hydrateProductList, normalizePriceTiers } from "../utils/priceTiers";

const WISHLIST_LOGIN_MESSAGE = "Please log in first to save items to your wishlist.";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const { requestLogin } = useLoginPrompt();
  const [items, setItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [catalogTick, setCatalogTick] = useState(0);
  const [apiProducts, setApiProducts] = useState([]);
  const [ready, setReady] = useState(false);
  const cartListeners = useRef(new Set());
  const syncingRef = useRef(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const products = useMemo(() => {
    return hydrateProductList(apiProducts.length ? apiProducts : getStorefrontProducts());
  }, [apiProducts, catalogTick]);

  const persistCart = useCallback(async (nextItems) => {
    if (!getToken("customer")) return;
    try {
      syncingRef.current = true;
      const result = await replaceCartApi(nextItems);
      if (Array.isArray(result?.items)) setItems(result.items);
    } catch {
      // Keep local optimistic state if sync fails.
    } finally {
      syncingRef.current = false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    refreshStorefrontProducts()
      .then((list) => {
        if (!cancelled) setApiProducts(list);
      })
      .catch(() => {
        if (!cancelled) setApiProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCustomerState() {
      if (!user || !getToken("customer")) {
        setItems([]);
        setWishlist([]);
        setNotifications([]);
        setReady(true);
        return;
      }

      setReady(false);
      try {
        const [cart, wish, notifs] = await Promise.all([
          fetchCartApi(),
          fetchWishlistApi(),
          fetchNotificationsApi(),
        ]);
        if (cancelled) return;
        setItems(Array.isArray(cart?.items) ? cart.items : []);
        setWishlist(
          Array.isArray(wish)
            ? wish.map((entry) => ({ id: Number(entry.id), addedAt: entry.addedAt ?? null }))
            : []
        );
        setNotifications(Array.isArray(notifs) ? notifs : []);
      } catch {
        if (!cancelled) {
          setItems([]);
          setWishlist([]);
          setNotifications([]);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    loadCustomerState();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    function handleStorage(event) {
      const key = event.key || event.detail?.key;
      if (!key || key === "wasooli_admin_products_v1") {
        setApiProducts(getStorefrontProducts());
        setCatalogTick((tick) => tick + 1);
      }
    }
    window.addEventListener("storage", handleStorage);
    window.addEventListener(DATA_EVENT, handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(DATA_EVENT, handleStorage);
    };
  }, []);

  const deductStock = useCallback(async () => {
    try {
      const list = await refreshStorefrontProducts();
      setApiProducts(list);
    } catch {
      // Keep current catalog if refresh fails.
    }
  }, []);

  const openCart = useCallback(() => {
    cartListeners.current.forEach((listener) => listener());
  }, []);

  const subscribeCartOpen = useCallback((listener) => {
    cartListeners.current.add(listener);
    return () => cartListeners.current.delete(listener);
  }, []);

  const addItem = useCallback(
    (product, quantity = 1) => {
      const requested = Math.max(1, Number(quantity) || 1);
      const stock = Number.isFinite(product.stock) ? product.stock : null;
      const tiers = normalizePriceTiers(product.priceTiers);
      const basePrice = Number(product.price) || 0;

      setItems((current) => {
        const existing = current.find((item) => item.id === product.id);
        const currentQty = existing?.quantity ?? 0;
        const nextQty =
          stock === null
            ? currentQty + requested
            : Math.min(stock, currentQty + requested);

        if (nextQty <= 0) return current;

        const unitPrice = getUnitPrice(product, nextQty);
        const next = existing
          ? current.map((item) =>
              item.id === product.id
                ? {
                    ...item,
                    quantity: nextQty,
                    stock,
                    price: unitPrice,
                    basePrice,
                    priceTiers: tiers,
                  }
                : item
            )
          : [
              ...current,
              {
                id: product.id,
                slug: product.slug,
                title: product.title,
                image: product.image,
                price: unitPrice,
                basePrice,
                priceTiers: tiers,
                stock,
                quantity: nextQty,
              },
            ];

        void persistCart(next);
        return next;
      });
    },
    [persistCart]
  );

  const updateQuantity = useCallback(
    (id, quantity) => {
      setItems((current) => {
        const next = current.flatMap((item) => {
          if (item.id !== id) return [item];
          const stock = Number.isFinite(item.stock) ? item.stock : null;
          const nextQty = Math.max(1, Number(quantity) || 1);
          const capped = stock === null ? nextQty : Math.min(stock, nextQty);
          const catalog = products.find((product) => Number(product.id) === Number(id));
          const source = {
            price: catalog?.price ?? item.basePrice ?? item.price,
            priceTiers: catalog?.priceTiers ?? item.priceTiers,
          };
          return [
            {
              ...item,
              quantity: capped,
              price: getUnitPrice(source, capped),
              basePrice: Number(source.price) || 0,
              priceTiers: normalizePriceTiers(source.priceTiers),
            },
          ];
        });
        void persistCart(next);
        return next;
      });
    },
    [persistCart, products]
  );

  const removeItem = useCallback(
    (id) => {
      setItems((current) => {
        const next = current.filter((item) => item.id !== id);
        void persistCart(next);
        return next;
      });
    },
    [persistCart]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    void clearCartApi().catch(() => {});
  }, []);

  const toggleWishlist = useCallback(async (id) => {
    if (!requestLogin(undefined, WISHLIST_LOGIN_MESSAGE)) return;

    const productId = Number(id);
    const exists = wishlist.some((entry) => entry.id === productId);
    setWishlist((current) => {
      if (exists) return current.filter((entry) => entry.id !== productId);
      return [...current, { id: productId, addedAt: new Date().toISOString() }];
    });
    try {
      const next = exists
        ? await removeWishlistApi(productId)
        : await addWishlistApi(productId);
      if (Array.isArray(next)) {
        setWishlist(next.map((entry) => ({ id: Number(entry.id), addedAt: entry.addedAt ?? null })));
      }
    } catch {
      // Revert on failure by reloading.
      try {
        const wish = await fetchWishlistApi();
        setWishlist(
          Array.isArray(wish)
            ? wish.map((entry) => ({ id: Number(entry.id), addedAt: entry.addedAt ?? null }))
            : []
        );
      } catch {
        /* ignore */
      }
    }
  }, [wishlist, requestLogin]);

  const isWished = useCallback(
    (id) => wishlist.some((entry) => entry.id === Number(id)),
    [wishlist]
  );

  const markNotificationsRead = useCallback(() => {
    setNotifications((current) => {
      if (!current.some((item) => !item.read)) return current;
      return current.map((item) => (item.read ? item : { ...item, read: true }));
    });
    void markAllNotificationsReadApi().catch(() => {});
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    void markAllNotificationsReadApi().catch(() => {});
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!getToken("customer")) return;
    try {
      const notifs = await fetchNotificationsApi();
      setNotifications(Array.isArray(notifs) ? notifs : []);
    } catch {
      /* ignore */
    }
  }, []);

  const pricedItems = useMemo(
    () =>
      items.map((item) => {
        const catalog = products.find((product) => Number(product.id) === Number(item.id));
        const source = {
          price: catalog?.price ?? item.basePrice ?? item.price,
          priceTiers: catalog?.priceTiers ?? item.priceTiers,
        };
        return {
          ...item,
          price: getUnitPrice(source, item.quantity),
          basePrice: Number(source.price) || 0,
          priceTiers: normalizePriceTiers(source.priceTiers),
        };
      }),
    [items, products]
  );

  const cartCount = pricedItems.reduce((total, item) => total + item.quantity, 0);
  const notificationCount = notifications.filter((item) => !item.read).length;

  const value = useMemo(
    () => ({
      products,
      items: pricedItems,
      cartCount,
      ready,
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
      refreshNotifications,
    }),
    [
      products,
      pricedItems,
      cartCount,
      ready,
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
      refreshNotifications,
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
