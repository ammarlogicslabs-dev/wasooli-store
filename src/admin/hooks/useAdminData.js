import { useEffect, useState } from "react";
import {
  getSettings,
  listCategories,
  listCoupons,
  listCustomers,
  listInventoryHistory,
  listOrders,
  listProducts,
  refreshAdminData,
} from "../../services/storage/adminDataService";
import { DATA_EVENT } from "../../services/storage/storageService";

function readSnapshot(tick = 0) {
  return {
    tick,
    products: listProducts(),
    categories: listCategories(),
    orders: listOrders(),
    customers: listCustomers(),
    coupons: listCoupons(),
    history: listInventoryHistory(),
    settings: getSettings(),
  };
}

export function useAdminData() {
  const [snapshot, setSnapshot] = useState(() => readSnapshot(0));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let count = 0;
    let cancelled = false;

    const refreshFromCache = () => {
      count += 1;
      setSnapshot(readSnapshot(count));
    };

    const load = async () => {
      try {
        await refreshAdminData();
        if (!cancelled) {
          setError("");
          refreshFromCache();
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load admin data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    window.addEventListener(DATA_EVENT, refreshFromCache);
    window.addEventListener("focus", load);
    return () => {
      cancelled = true;
      window.removeEventListener(DATA_EVENT, refreshFromCache);
      window.removeEventListener("focus", load);
    };
  }, []);

  return { ...snapshot, loading, error };
}

export function paginate(list, page, size) {
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / size) || 1);
  const safePage = Math.min(Math.max(1, page), pages);
  const start = (safePage - 1) * size;
  return { page: safePage, pages, total, items: list.slice(start, start + size) };
}
