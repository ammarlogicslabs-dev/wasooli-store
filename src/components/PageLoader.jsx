import { motion, useReducedMotion } from "framer-motion";

export default function PageLoader({ overlay = false }) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={
        overlay
          ? "fixed inset-0 z-[90] flex flex-col items-center justify-center gap-4 bg-white/95 backdrop-blur-xs"
          : "flex h-dvh flex-col items-center justify-center gap-4 bg-white"
      }
      aria-live="polite"
      aria-busy="true"
    >
      <motion.div
        className="flex flex-col items-center gap-4"
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
        <div className="relative h-1 w-32 sm:w-36 overflow-hidden rounded-full bg-slate-100 shadow-inner">
          <motion.div
            className="absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-sky-400"
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
      </motion.div>

      <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
        Loading…
      </p>
    </div>
  );
}
