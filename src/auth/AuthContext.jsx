import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const PASSWORD_KEY = "wasooli_password";

const DEMO_USER = {
  id: 1,
  name: "Wasooli",
  email: "wasooli123@gmail.com",
  password: "wasooli123",
};

function readPassword() {
  try {
    return localStorage.getItem(PASSWORD_KEY) || DEMO_USER.password;
  } catch {
    return DEMO_USER.password;
  }
}

const ACCEPTED_IDENTIFIERS = [
  DEMO_USER.email,
  DEMO_USER.name,
  "wasooli123@gmail.com",
].map((value) => value.toLowerCase());

function getSavedUser() {
  try {
    const savedUser = localStorage.getItem("wasooli_user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getSavedUser);

  function login(identifier, password) {
    const validCredentials = ACCEPTED_IDENTIFIERS.includes(identifier.trim().toLowerCase()) && password === readPassword();

    if (!validCredentials) {
      return {
        success: false,
        message: "Invalid username, email, or password.",
      };
    }

    const loggedInUser = {
      id: DEMO_USER.id,
      name: DEMO_USER.name,
      email: DEMO_USER.email,
    };

    setUser(loggedInUser);
    localStorage.setItem("wasooli_user", JSON.stringify(loggedInUser));

    return { success: true };
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("wasooli_user");
  }

  function changePassword(currentPassword, nextPassword) {
    if (currentPassword !== readPassword()) {
      return { success: false, message: "Current password is incorrect." };
    }

    const next = String(nextPassword || "");
    if (next.length < 6) {
      return { success: false, message: "New password must be at least 6 characters." };
    }
    if (next === currentPassword) {
      return { success: false, message: "Choose a different password." };
    }

    localStorage.setItem(PASSWORD_KEY, next);
    return { success: true };
  }

  return (
    <AuthContext.Provider
      value={{
        user,
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
