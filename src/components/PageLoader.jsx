import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";

export default function PageLoader({
  overlay = false,
  contained = false,
  admin = false,
  collapsed = false,
  className = "",
  message = "Loading…",
}) {
  const reduceMotion = useReducedMotion();

  if (contained) {
    return (
      <div className={`flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 py-12 ${className}`}>
        <LoaderContent reduceMotion={reduceMotion} message={message} />
      </div>
    );
  }

  // Fullscreen / overlay container with guaranteed viewport centering
  const baseClasses = `wasooli-page-loader-overlay ${
    admin ? "wasooli-page-loader-admin bg-slate-50/90" : overlay ? "bg-white/95" : "bg-white"
  } ${admin ? (collapsed ? "sidebar-collapsed" : "sidebar-expanded") : ""} backdrop-blur-sm ${className}`;

  const content = (
    <div
      className={baseClasses}
      aria-live="polite"
      aria-busy="true"
    >
      <LoaderContent reduceMotion={reduceMotion} message={message} />
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(content, document.body);
  }

  return content;
}

function LoaderContent({ reduceMotion, message }) {
  return (
    <motion.div
      className="m-auto flex flex-col items-center justify-center gap-4 px-4 text-center"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* Full Brand Logo (No circle clipping) */}
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [1, 1.025, 1],
                opacity: [0.95, 1, 0.95],
              }
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative flex items-center justify-center px-2 py-1"
      >
        <img
          src="/wasooli.png"
          alt="Wasooli Store"
          className="h-12 sm:h-14 w-auto object-contain select-none drop-shadow-xs"
        />
      </motion.div>

      {/* Sleek branded loading bar */}
      <div className="relative h-1.5 w-32 sm:w-36 overflow-hidden rounded-full bg-slate-100 shadow-inner">
        <motion.div
          className="absolute inset-y-0 w-1/2 rounded-full bg-linear-to-r from-brand-400 via-brand-500 to-sky-400 shadow-[0_0_8px_rgba(44,154,255,0.6)]"
          animate={
            reduceMotion
              ? undefined
              : {
                  x: ["-100%", "200%"],
                }
          }
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
        {message}
      </p>
    </motion.div>
  );
}
