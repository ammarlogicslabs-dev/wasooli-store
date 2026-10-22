import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import PageLoader from "../components/PageLoader";

const EASE = [0.22, 1, 0.36, 1];

function locationKey(location) {
  return `${location.pathname}${location.search}`;
}

/** Soft page enter + PageLoader only on real navigations (not F5 / first paint). */
export default function PageTransition() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const reduceMotion = useReducedMotion();
  const [loading, setLoading] = useState(false);
  const prevKey = useRef(null);

  useEffect(() => {
    const next = locationKey(location);

    // First paint (incl. F5 / StrictMode remount on same URL): no second loader.
    if (prevKey.current === null || prevKey.current === next) {
      prevKey.current = next;
      return undefined;
    }

    prevKey.current = next;
    setLoading(true);
    const done = window.setTimeout(
      () => setLoading(false),
      reduceMotion ? 80 : navigationType === "POP" ? 180 : 280,
    );
    return () => window.clearTimeout(done);
  }, [location, reduceMotion, navigationType]);

  return (
    <div className="relative min-h-[50vh]">
      {loading ? <PageLoader overlay /> : null}
      <motion.div
        key={locationKey(location)}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: loading ? 0 : 1, y: loading ? 6 : 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.28, ease: EASE, delay: loading ? 0 : 0.02 }
        }
      >
        <Outlet />
      </motion.div>
    </div>
  );
}
