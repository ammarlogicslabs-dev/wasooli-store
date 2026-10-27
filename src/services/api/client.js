const DEFAULT_API_URL = "https://wasoolistoreapi.wasooli.pk";

export const API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, "");

export const TOKEN_KEYS = {
  customer: "wasooli_api_token",
  admin: "wasooli_admin_api_token",
};

export function getToken(kind = "customer") {
  try {
    return localStorage.getItem(TOKEN_KEYS[kind] || TOKEN_KEYS.customer) || "";
  } catch {
    return "";
  }
}

export function setToken(kind, token) {
  const key = TOKEN_KEYS[kind] || TOKEN_KEYS.customer;
  if (!token) {
    localStorage.removeItem(key);
    return;
  }
  localStorage.setItem(key, token);
}

export function clearTokens() {
  Object.values(TOKEN_KEYS).forEach((key) => localStorage.removeItem(key));
}

export async function apiRequest(path, { method = "GET", body, token, kind = "customer", formData } = {}) {
  const headers = {};
  const auth = token ?? getToken(kind);
  if (auth) headers.Authorization = `Bearer ${auth}`;

  let payload = body;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: payload,
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message = data?.message || (typeof data === "string" ? data : `Request failed (${response.status})`);
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
