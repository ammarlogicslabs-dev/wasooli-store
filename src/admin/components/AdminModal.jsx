import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

export default function AdminModal({
  open,
  title,
  onClose,
  children,
  wide = false,
  maxWidth = "",
}) {
  const reduceMotion = useReducedMotion();

  // Lock scrolling & handle Escape key
  useEffect(() => {
    if (!open) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    // Lock scrolling completely so background page cannot scroll
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overflow = "hidden";

    if (typeof window !== "undefined" && window.__lenis) {
      window.__lenis.stop();
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      document.documentElement.style.overflow = previousHtmlOverflow;

      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.start();
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const widthClass = maxWidth || (wide ? "sm:max-w-3xl" : "sm:max-w-lg");

  const backdropTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: EASE };

  const panelTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 380, damping: 28, mass: 0.85 };

  const modalContent = (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-99999 flex items-end justify-center sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] cursor-default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className={`relative max-h-[92vh] w-full overflow-y-auto custom-scrollbar rounded-t-3xl bg-white p-5 shadow-[0_24px_64px_rgb(15_23_42/0.22)] sm:rounded-3xl sm:p-6 ${widthClass}`}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 36, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.96 }}
            transition={panelTransition}
          >
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid size-9 cursor-pointer place-items-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            {children}
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
