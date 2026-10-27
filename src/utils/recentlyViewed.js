const STORAGE_KEY = "wasooli-recently-viewed";
const MAX_ITEMS = 12;

export function getRecentlyViewedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    console.warn("Failed to retrieve recently viewed items from localStorage.");
    return [];
  }
}

export function pushRecentlyViewed(productId) {
  if (productId == null || productId === "") return;
  const id = String(productId);
  const next = [id, ...getRecentlyViewedIds().filter((item) => item !== id)].slice(
    0,
    MAX_ITEMS
  );
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    console.warn("Failed to save recently viewed items to localStorage.");
  }
  return next;
}
