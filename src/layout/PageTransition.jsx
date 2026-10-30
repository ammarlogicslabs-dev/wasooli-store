import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigationType, useOutletContext } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import PageLoader from "../components/PageLoader";
import StoreFooter from "../components/StoreFooter";

const EASE = [0.22, 1, 0.36, 1];

function locationKey(location) {
  return location.pathname;
}

/** Soft page enter + PageLoader only on real navigations (not F5 / first paint). */
export default function PageTransition() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const reduceMotion = useReducedMotion();
  const [loading, setLoading] = useState(false);
  const prevKey = useRef(null);

  const isAdmin = location.pathname.startsWith("/admin");
  const outletContext = useOutletContext();
  const collapsed = outletContext?.collapsed ?? false;

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
      reduceMotion ? 80 : isAdmin ? 220 : navigationType === "POP" ? 180 : 280,
    );
    return () => window.clearTimeout(done);
  }, [location, reduceMotion, navigationType, isAdmin]);

  return (
    <div className={`relative flex flex-col justify-between ${isAdmin ? "min-h-[calc(100vh-6rem)]" : "min-h-screen"}`}>
      {loading ? (
        isAdmin ? (
          <PageLoader admin collapsed={collapsed} />
        ) : (
          <PageLoader overlay />
        )
      ) : null}
      <motion.div
        key={locationKey(location)}
        className="flex-1"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: loading ? 0 : 1, y: loading ? 6 : 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.28, ease: EASE, delay: loading ? 0 : 0.02 }
        }
      >
        <Outlet context={outletContext} />
      </motion.div>
      {!isAdmin ? <StoreFooter /> : null}
    </div>
  );
}
