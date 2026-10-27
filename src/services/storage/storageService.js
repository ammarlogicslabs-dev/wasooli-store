export const DATA_EVENT = "wasooli-data";

export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null || raw === "") return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJson(key, value, { silent = false } = {}) {
  localStorage.setItem(key, JSON.stringify(value));
  if (!silent && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(DATA_EVENT, { detail: { key } }));
  }
}

export function removeStorageKey(key, { silent = false } = {}) {
  localStorage.removeItem(key);
  if (!silent && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(DATA_EVENT, { detail: { key } }));
  }
}
