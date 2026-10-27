import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiRequest, getToken, setToken } from "../services/api/client";
import { passwordPolicyError } from "../utils/passwordPolicy";

const AuthContext = createContext(null);
const USER_KEY = "wasooli_user";

function readSavedUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSavedUser);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const token = getToken("customer");
      if (!token) {
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const me = await apiRequest("/api/auth/me", { kind: "customer" });
        if (me.role !== "Customer") {
          setToken("customer", "");
          localStorage.removeItem(USER_KEY);
          if (!cancelled) setUser(null);
        } else {
          const next = { id: me.id, name: me.name, email: me.email, avatarUrl: me.avatarUrl || "" };
          localStorage.setItem(USER_KEY, JSON.stringify(next));
          if (!cancelled) setUser(next);
        }
      } catch {
        setToken("customer", "");
        localStorage.removeItem(USER_KEY);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (identifier, password) => {
    try {
      const result = await apiRequest("/api/auth/login", {
        method: "POST",
        body: { identifier, password },
      });
      if (result.user?.role === "Admin") {
        return { success: false, role: "Admin" };
      }
      if (result.user?.role !== "Customer") {
        return { success: false, message: "Invalid username, email, or password." };
      }
      setToken("customer", result.token);
      const loggedInUser = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        avatarUrl: result.user.avatarUrl || "",
      };
      localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return { success: true, role: "Customer" };
    } catch (error) {
      return { success: false, message: error.message || "Invalid username, email, or password." };
    }
  }, []);

  const logout = useCallback(() => {
    setToken("customer", "");
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const changePassword = useCallback(async (currentPassword, nextPassword) => {
    const next = String(nextPassword || "");
    const policyError = passwordPolicyError(next);
    if (policyError) {
      return { success: false, message: policyError.replace(/^Password/, "New password") };
    }
    if (next === currentPassword) {
      return { success: false, message: "Choose a different password." };
    }
    try {
      await apiRequest("/api/auth/change-password", {
        method: "POST",
        kind: "customer",
        body: { currentPassword, newPassword: next },
      });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || "Could not change password." };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        isAuthenticated: Boolean(user),
        login,
        logout,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
