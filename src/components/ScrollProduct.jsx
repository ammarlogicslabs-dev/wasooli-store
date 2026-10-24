import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

/**
 * Scroll-linked 3D entrance/exit for a product card.
 * Each card animates individually: columns start one after another
 * (left → right), and rows arrive naturally top → bottom while scrolling.
 */
const STEP = 0.055; // har agle column ki delay (scroll progress mein). Barha do to gap zyada hoga.

export default function ScrollProduct({ children, index = 0, columns = 4, className = "h-full" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [cols, setCols] = useState(Math.max(columns, 1));

  // Grid ke asal columns padho (mobile 2, tablet 3, desktop 4...)
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
  const d = col * STEP; // is card ki delay

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 130, damping: 28, mass: 0.4 });

  // Entrance ranges ko column ke hisaab se aage shift kiya (exit sab ka same)
  const opacity = useTransform(progress, [d, 0.2 + d, 0.8, 1], [0, 1, 1, 0.1]);
  const y = useTransform(progress, [d, 0.24 + d, 0.76, 1], [110, 0, 0, -48]);
  const rotateX = useTransform(progress, [d, 0.26 + d, 0.74, 1], [32, 0, 0, -14]);
  const rotateZ = useTransform(progress, [d, 0.26 + d], [col % 2 ? 2.5 : -2.5, 0]);
  const scale = useTransform(progress, [d, 0.26 + d, 0.74, 1], [0.86, 1, 1, 0.95]);

  if (reduce) return <div ref={ref} className={className}>{children}</div>;

  return (
    <div ref={ref} className={className}>
      <motion.div
        style={{
          opacity,
          y,
          rotateX,
          rotateZ,
          scale,
          transformPerspective: 1100,
          transformOrigin: "50% 100%",
        }}
        className="h-full will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}