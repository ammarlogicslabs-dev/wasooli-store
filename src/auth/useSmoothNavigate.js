import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

/** navigate() with View Transition when the browser supports it. */
export function useSmoothNavigate() {
  const navigate = useNavigate();

  return useCallback(
    (to, options = {}) => {
      const supportsVT = typeof document !== "undefined" && "startViewTransition" in document;
      return navigate(to, {
        ...options,
        viewTransition: options.viewTransition ?? supportsVT,
      });
    },
    [navigate],
  );
}
