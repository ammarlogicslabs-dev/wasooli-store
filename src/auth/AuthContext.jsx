import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const DEMO_USER = {
  id: 1,
  name: "Wasooli",
  email: "wasooli123@gmail.com",
  password: "wasooli123",
};

const ACCEPTED_IDENTIFIERS = [
  DEMO_USER.email,
  DEMO_USER.name,
  "wassoli123@gmail.com",
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
    const validCredentials =
      ACCEPTED_IDENTIFIERS.includes(identifier.trim().toLowerCase()) &&
      password === DEMO_USER.password;

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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        logout,
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
