import { useEffect, useState } from "react";
import {
  getSettings,
  listCategories,
  listCoupons,
  listCustomers,
  listInventoryHistory,
  listOrders,
  listProducts,
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

  useEffect(() => {
    let count = 0;
    const refresh = () => {
      count += 1;
      setSnapshot(readSnapshot(count));
    };
    refresh();
    window.addEventListener(DATA_EVENT, refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener(DATA_EVENT, refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  return snapshot;
}

export function paginate(list, page, size) {
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / size) || 1);
  const safePage = Math.min(Math.max(1, page), pages);
  const start = (safePage - 1) * size;
  return { page: safePage, pages, total, items: list.slice(start, start + size) };
}
