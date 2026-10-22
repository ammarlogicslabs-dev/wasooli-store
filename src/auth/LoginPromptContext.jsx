import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginRequiredModal from "../components/LoginRequiredModal";
import { useAuth } from "./AuthContext";
import { LOGIN_REQUIRED_MESSAGE } from "./requireLogin";

const LoginPromptContext = createContext(null);

export function LoginPromptProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [prompt, setPrompt] = useState(null);

  const requestLogin = useCallback(
    (from, message = LOGIN_REQUIRED_MESSAGE) => {
      if (isAuthenticated) return true;
      setPrompt({
        from: from || location,
        message: message || LOGIN_REQUIRED_MESSAGE,
      });
      return false;
    },
    [isAuthenticated, location],
  );

  const closePrompt = useCallback(() => {
    setPrompt(null);
  }, []);

  const confirmPrompt = useCallback(() => {
    const from = prompt?.from || { pathname: "/shop" };
    setPrompt(null);
    navigate("/login", {
      state: { from },
      viewTransition: typeof document !== "undefined" && "startViewTransition" in document,
    });
  }, [navigate, prompt]);

  const value = useMemo(() => ({ requestLogin, isAuthenticated }), [requestLogin, isAuthenticated]);

  return (
    <LoginPromptContext.Provider value={value}>
      {children}
      <LoginRequiredModal
        open={Boolean(prompt)}
        message={prompt?.message}
        onClose={closePrompt}
        onConfirm={confirmPrompt}
      />
    </LoginPromptContext.Provider>
  );
}

export function useLoginPrompt() {
  const context = useContext(LoginPromptContext);
  if (!context) throw new Error("useLoginPrompt must be used inside LoginPromptProvider");
  return context;
}
