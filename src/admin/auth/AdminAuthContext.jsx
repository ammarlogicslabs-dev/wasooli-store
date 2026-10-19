import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiRequest, getToken, setToken } from "../../services/api/client";

export const ADMIN_SESSION_KEY = "wasooli_demo_admin_session";

const DEMO_ADMIN_IDENTIFIERS = ["admin@wasooli.store", "admin"];

export function isAdminIdentifier(value) {
  return DEMO_ADMIN_IDENTIFIERS.includes(String(value || "").trim().toLowerCase());
}

const AdminAuthContext = createContext(null);

function readSession() {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY) || sessionStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(session) {
  const raw = JSON.stringify(session);
  localStorage.setItem(ADMIN_SESSION_KEY, raw);
  sessionStorage.setItem(ADMIN_SESSION_KEY, raw);
}

function clearSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(readSession);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const token = getToken("admin");
      if (!token) {
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const me = await apiRequest("/api/auth/me", { kind: "admin" });
        if (me.role !== "Admin") {
          setToken("admin", "");
          clearSession();
          if (!cancelled) setAdmin(null);
        } else {
          const session = {
            email: me.email,
            name: me.name,
            avatarUrl: me.avatarUrl || "",
            loggedInAt: new Date().toISOString(),
          };
          writeSession(session);
          if (!cancelled) setAdmin(session);
        }
      } catch {
        setToken("admin", "");
        clearSession();
        if (!cancelled) setAdmin(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const result = await apiRequest("/api/auth/login", {
        method: "POST",
        body: { identifier: email, password },
      });
      if (result.user?.role !== "Admin") {
        return { success: false, message: "Invalid admin username, email, or password." };
      }
      setToken("admin", result.token);
      const session = {
        email: result.user.email,
        name: result.user.name,
        avatarUrl: result.user.avatarUrl || "",
        loggedInAt: new Date().toISOString(),
      };
      writeSession(session);
      setAdmin(session);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || "Invalid admin username, email, or password." };
    }
  }, []);

  const logout = useCallback(() => {
    setToken("admin", "");
    clearSession();
    setAdmin(null);
  }, []);

  const updateProfile = useCallback(async (patch) => {
    const nextName = String(patch.name || "").trim();
    if (!nextName) return { ok: false, message: "Enter a display name." };
    try {
      const result = await apiRequest("/api/admin/profile", {
        method: "PUT",
        kind: "admin",
        body: { name: nextName, avatarUrl: patch.avatarUrl || "" },
      });
      const next = {
        ...(admin || {}),
        name: result.profile?.name || nextName,
        email: result.profile?.email || admin?.email,
        avatarUrl: result.profile?.avatarUrl || "",
      };
      writeSession(next);
      setAdmin(next);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message || "Could not update profile." };
    }
  }, [admin]);

  const value = {
    admin,
    ready,
    isAuthenticated: Boolean(admin),
    login,
    logout,
    updateProfile,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return context;
}
