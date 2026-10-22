import { motion, useReducedMotion } from "framer-motion";

export default function PageLoader({ overlay = false }) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={
        overlay
          ? "fixed inset-0 z-[90] flex flex-col items-center justify-center gap-4 bg-slate-50"
          : "flex h-dvh flex-col items-center justify-center gap-4 bg-slate-50"
      }
      aria-live="polite"
      aria-busy="true"
    >
      <motion.div
        className="relative grid size-14 place-items-center"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        <span className="absolute inset-0 rounded-full border-2 border-brand-100" />
        <span
          className={`absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 ${
            reduceMotion ? "" : "animate-spin"
          }`}
        />
        <span className="grid size-9 place-items-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-brand-100">
          <img src="/wasooli.png" alt="" className="h-full w-full object-cover" />
        </span>
      </motion.div>
      <p className="text-xs font-medium tracking-wide text-slate-500">Loading…</p>
    </div>
  );
}
