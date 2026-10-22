import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useLoginPrompt } from "../auth/LoginPromptContext";
import { LOGIN_REQUIRED_MESSAGE } from "../auth/requireLogin";
import PageLoader from "./PageLoader";

/** Blocks a route until logged in; opens login modal instead of redirecting immediately. */
export default function RequireLogin({ children, message = LOGIN_REQUIRED_MESSAGE }) {
  const { isAuthenticated } = useAuth();
  const { requestLogin } = useLoginPrompt();
  const navigate = useNavigate();
  const location = useLocation();
  const prompted = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      prompted.current = false;
      return;
    }
    if (prompted.current) return;
    prompted.current = true;
    requestLogin(location, message);
    navigate("/shop", {
      replace: true,
      viewTransition: typeof document !== "undefined" && "startViewTransition" in document,
    });
  }, [isAuthenticated, requestLogin, location, message, navigate]);

  if (!isAuthenticated) return <PageLoader />;
  return children;
}
