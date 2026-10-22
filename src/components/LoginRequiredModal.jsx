import { LogIn } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

export default function LoginRequiredModal({
  open,
  title = "Login required",
  message = "Please log in first to continue to checkout.",
  confirmLabel = "Go to login",
  onConfirm,
  onClose,
}) {
  const reduceMotion = useReducedMotion();

  const backdropTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: EASE };

  const panelTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 380, damping: 28, mass: 0.85 };

  const itemTransition = (delay) => (
    reduceMotion
      ? { duration: 0 }
      : { duration: 0.35, ease: EASE, delay }
  );

  return (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-[80] grid place-items-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-required-title"
        >
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 cursor-default bg-slate-900/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-5 shadow-[0_24px_64px_rgb(15_23_42/0.22)] sm:p-6"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 36, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.96 }}
            transition={panelTransition}
          >
            <motion.div
              className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-brand-100/70 blur-2xl"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={itemTransition(0.05)}
              aria-hidden="true"
            />

            <motion.div
              className="relative flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.6, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={itemTransition(0.08)}
            >
              {!reduceMotion ? (
                <span
                  className="absolute inset-0 animate-ping rounded-2xl bg-brand-200/40"
                  style={{ animationDuration: "1.6s" }}
                  aria-hidden="true"
                />
              ) : null}
              <LogIn size={24} className="relative" aria-hidden="true" />
            </motion.div>

            <motion.h2
              id="login-required-title"
              className="relative mt-4 text-lg font-semibold text-slate-900"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={itemTransition(0.14)}
            >
              {title}
            </motion.h2>

            <motion.p
              className="relative mt-2 text-sm leading-6 text-slate-600"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={itemTransition(0.2)}
            >
              {message}
            </motion.p>

            <motion.div
              className="relative mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={itemTransition(0.26)}
            >
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600 active:scale-[0.98]"
              >
                <LogIn size={16} aria-hidden="true" />
                {confirmLabel}
              </button>
            </motion.div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
