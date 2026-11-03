import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

function DialogIcon({ tone, title, confirmLabel }) {
  const titleStr = typeof title === "string" ? title.toLowerCase() : "";
  const labelStr = typeof confirmLabel === "string" ? confirmLabel.toLowerCase() : "";

  if (tone === "danger") {
    if (titleStr.includes("delete") || labelStr.includes("delete") || titleStr.includes("remove")) {
      return <Trash2 size={24} className="relative" aria-hidden="true" />;
    }
    if (titleStr.includes("archive") || labelStr.includes("archive")) {
      return <Archive size={24} className="relative" aria-hidden="true" />;
    }
    return <AlertTriangle size={24} className="relative" aria-hidden="true" />;
  }
  if (tone === "success") {
    if (titleStr.includes("restore") || labelStr.includes("restore")) {
      return <ArchiveRestore size={24} className="relative" aria-hidden="true" />;
    }
    return <CheckCircle2 size={24} className="relative" aria-hidden="true" />;
  }
  return <HelpCircle size={24} className="relative" aria-hidden="true" />;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading = false,
  onConfirm,
  onClose,
}) {
  const reduceMotion = useReducedMotion();

  // Escape key listener & background scroll lock
  useEffect(() => {
    if (!open) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overflow = "hidden";

    if (typeof window !== "undefined" && window.__lenis) {
      window.__lenis.stop();
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
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
  }, [open, onClose, loading]);

  const glowClass =
    tone === "danger"
      ? "bg-rose-100/70"
      : tone === "success"
      ? "bg-emerald-100/70"
      : "bg-brand-100/70";

  const badgeClass =
    tone === "danger"
      ? "bg-rose-50 text-rose-600"
      : tone === "success"
      ? "bg-emerald-50 text-emerald-600"
      : "bg-brand-50 text-brand-600";

  const pingClass =
    tone === "danger"
      ? "bg-rose-200/40"
      : tone === "success"
      ? "bg-emerald-200/40"
      : "bg-brand-200/40";

  const confirmBtnClass =
    tone === "danger"
      ? "bg-red-600 hover:bg-red-700"
      : tone === "success"
      ? "bg-emerald-600 hover:bg-emerald-700"
      : "bg-brand-500 hover:bg-brand-600";

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
        >
          {/* Backdrop */}
          <motion.div
            aria-hidden="true"
            className={`absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] ${
              loading ? "cursor-wait" : "cursor-default"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
            onClick={loading ? undefined : onClose}
          />

          {/* Modal Panel */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-5 shadow-[0_24px_64px_rgb(15_23_42/0.22)] sm:p-6"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 36, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.96 }}
            transition={panelTransition}
          >
            {/* Ambient Background Glow */}
            <motion.div
              className={`pointer-events-none absolute -right-10 -top-10 size-36 rounded-full blur-2xl ${glowClass}`}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={itemTransition(0.05)}
              aria-hidden="true"
            />

            {/* Icon Badge */}
            <motion.div
              className={`relative flex size-14 items-center justify-center rounded-2xl ${badgeClass}`}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.6, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={itemTransition(0.08)}
            >
              {!reduceMotion ? (
                <span
                  className={`absolute inset-0 animate-ping rounded-2xl ${pingClass}`}
                  style={{ animationDuration: "1.8s" }}
                  aria-hidden="true"
                />
              ) : null}
              <DialogIcon tone={tone} title={title} confirmLabel={confirmLabel} />
            </motion.div>

            {/* Title */}
            <motion.h2
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
              className="relative mt-6 flex justify-end gap-2.5"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={itemTransition(0.26)}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4.5 text-sm font-semibold text-white shadow-xs transition active:scale-[0.98] ${
                  loading
                    ? "cursor-wait opacity-85"
                    : "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                } ${confirmBtnClass}`}
              >
                {loading && <Loader2 size={16} className="animate-spin shrink-0" />}
                <span>{loading ? `${confirmLabel}...` : confirmLabel}</span>
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
