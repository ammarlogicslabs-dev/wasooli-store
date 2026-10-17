import { createContext, useContext, useEffect, useState } from "react";
import { ADMIN_SESSION_KEY, ensureAdminSeed, getSettings, saveSettings } from "../../services/storage/adminDataService";

const DEMO_ADMIN = {
  email: "admin@wasooli.store",
  username: "admin",
  password: "admin123",
};

const ADMIN_IDENTIFIERS = [DEMO_ADMIN.email, DEMO_ADMIN.username];

export function isAdminIdentifier(value) {
  return ADMIN_IDENTIFIERS.includes(String(value || "").trim().toLowerCase());
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

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(readSession);

  useEffect(() => {
    ensureAdminSeed();
    function handleStorage(event) {
      if (!event.key || event.key === ADMIN_SESSION_KEY) {
        setAdmin(readSession());
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function login(email, password) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedPassword = String(password || "").trim();
    const valid = isAdminIdentifier(normalizedEmail) && normalizedPassword === DEMO_ADMIN.password;
    if (!valid) {
      return {
        success: false,
        message: "Invalid admin username, email, or password.",
      };
    }
    const settings = getSettings();
    const session = {
      email: DEMO_ADMIN.email,
      name: settings.adminName || "Store Admin",
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    setAdmin(session);
    return { success: true };
  }

  function logout() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setAdmin(null);
  }

  function updateProfile(patch) {
    const nextName = String(patch.name || "").trim();
    if (!nextName) return { ok: false, message: "Enter a display name." };
    saveSettings({ adminName: nextName, avatarUrl: patch.avatarUrl || "" });
    const next = { ...(admin || {}), name: nextName, email: DEMO_ADMIN.email };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(next));
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(next));
    setAdmin(next);
    return { ok: true };
  }

  const value = {
    admin,
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
