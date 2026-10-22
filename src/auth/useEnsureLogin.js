import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useLoginPrompt } from "./LoginPromptContext";
import { LOGIN_REQUIRED_MESSAGE } from "./requireLogin";

/**
 * Returns true if logged in; otherwise opens the login-required modal.
 * Optional `from` is where login should return after success.
 */
export function useEnsureLogin(message = LOGIN_REQUIRED_MESSAGE) {
  const { requestLogin } = useLoginPrompt();
  const location = useLocation();

  return useCallback(
    (overrideMessage, from) => requestLogin(from || location, overrideMessage || message),
    [requestLogin, location, message],
  );
}
