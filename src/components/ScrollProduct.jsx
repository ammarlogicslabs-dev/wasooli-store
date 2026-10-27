import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

/**
 * Single-time entrance animation for a product card.
 * Animates in once when entering viewport, then remains stably in place
 * until the page is refreshed.
 */
export default function ScrollProduct({ children, index = 0, columns = 5, className = "h-full" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [cols, setCols] = useState(Math.max(columns, 1));

  // Determine actual responsive grid columns (mobile 2, tablet 3, desktop 5...)
  useEffect(() => {
    const grid = ref.current?.parentElement;
    if (!grid) return undefined;
    const read = () => {
      const tpl = getComputedStyle(grid).gridTemplateColumns;
      const n = tpl && tpl !== "none" ? tpl.split(" ").length : columns;
      setCols(Math.max(n, 1));
    };
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, [columns]);

  const col = index % cols;
  const delay = Math.min(col * 0.05, 0.3); // Stagger delay based on column

  if (reduce) return <div ref={ref} className={className}>{children}</div>;

  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{
          duration: 0.45,
          delay,
          ease: EASE,
        }}
        className="h-full will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}