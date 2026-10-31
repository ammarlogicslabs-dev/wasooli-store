import { useEffect } from "react";
import { createPortal } from "react-dom";
import { LogOut } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

export default function LogoutConfirmModal({
  open,
  title = "Log out of your account?",
  message = "You will be logged out of your account. You can log back in at any time with your credentials.",
  confirmLabel = "Log out",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
}) {
  const reduceMotion = useReducedMotion();

  // Escape key listener & background scroll lock
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Stop Lenis smooth scroll while modal is open
    if (typeof window !== "undefined" && window.__lenis) {
      window.__lenis.stop();
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.start();
      }
    };
  }, [open, onClose]);

  const backdropTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: EASE };

  const panelTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 380, damping: 28, mass: 0.85 };

  const itemTransition = (delay) =>
    reduceMotion
      ? { duration: 0 }
      : { duration: 0.35, ease: EASE, delay };

  const modalContent = (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-99999 grid place-items-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-dialog-title"
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 cursor-default bg-slate-900/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-5 shadow-[0_24px_64px_rgb(15_23_42/0.22)] sm:p-6"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 36, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.96 }}
            transition={panelTransition}
          >
            {/* Ambient Background Glow */}
            <motion.div
              className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-rose-100/70 blur-2xl"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={itemTransition(0.05)}
              aria-hidden="true"
            />

            {/* Logout Icon Badge with subtle pulse */}
            <motion.div
              className="relative flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.6, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={itemTransition(0.08)}
            >
              {!reduceMotion ? (
                <span
                  className="absolute inset-0 animate-ping rounded-2xl bg-rose-200/40"
                  style={{ animationDuration: "1.8s" }}
                  aria-hidden="true"
                />
              ) : null}
              <LogOut size={24} className="relative" aria-hidden="true" />
            </motion.div>

            {/* Title */}
            <motion.h2
              id="logout-dialog-title"
              className="relative mt-4 text-lg font-semibold text-slate-900"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={itemTransition(0.14)}
            >
              {title}
            </motion.h2>

            {/* Message */}
            <motion.p
              className="relative mt-2 text-sm leading-6 text-slate-600"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={itemTransition(0.2)}
            >
              {message}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              className="relative mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={itemTransition(0.26)}
            >
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-4.5 text-sm font-semibold text-white shadow-xs transition hover:bg-red-700 active:scale-[0.98]"
              >
                <LogOut size={16} aria-hidden="true" />
                {confirmLabel}
              </button>
            </motion.div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}

