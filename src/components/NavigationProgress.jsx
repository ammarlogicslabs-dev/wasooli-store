import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/** Thin top progress bar that runs on every route change. */
export default function NavigationProgress() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return null;

  return (
    <NavigationProgressBar
      key={`${location.pathname}${location.search}`}
    />
  );
}

function NavigationProgressBar() {
  const [visible, setVisible] = useState(true);
  const [width, setWidth] = useState(18);

  useEffect(() => {
    const tick = window.setTimeout(() => setWidth(72), 80);
    const almost = window.setTimeout(() => setWidth(92), 220);
    const done = window.setTimeout(() => {
      setWidth(100);
      window.setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 180);
    }, 420);

    return () => {
      window.clearTimeout(tick);
      window.clearTimeout(almost);
      window.clearTimeout(done);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          aria-hidden="true"
        >
          <motion.div
            className="h-full origin-left bg-gradient-to-r from-brand-500 via-brand-600 to-brand-500 shadow-[0_0_12px_rgb(44_154_255/0.55)]"
            initial={false}
            animate={{ width: `${width}%` }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
