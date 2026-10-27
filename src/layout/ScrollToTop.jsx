import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Instant jump pairs better with page fade than a long smooth scroll.
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
