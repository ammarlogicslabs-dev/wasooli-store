import { API_BASE_URL } from "../services/api/client";

export function resolveMediaUrl(url) {
  if (!url) return "";
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (url.startsWith("/uploads/")) return `${API_BASE_URL}${url}`;
  return url; // /products/... stays on the storefront
}
