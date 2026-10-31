import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";

export default function PageLoader({
  overlay = false,
  contained = false,
  admin = false,
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
    admin ? "bg-slate-50/95" : overlay ? "bg-white/95" : "bg-white"
  } backdrop-blur-sm ${className}`;

  const content = (
    <div
      className={baseClasses}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        maxWidth: "100%",
        height: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999,
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
      aria-live="polite"
      aria-busy="true"
    >
      {/* Absolute 50/50 transform centering for 100% precision on mobile devices */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "max-content",
          maxWidth: "92vw",
          margin: 0,
          padding: 0,
          textAlign: "center",
        }}
      >
        <LoaderContent reduceMotion={reduceMotion} message={message} />
      </div>
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
      className="flex flex-col items-center justify-center gap-4 px-4 text-center"
      style={{ margin: "0 auto", textAlign: "center" }}
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
