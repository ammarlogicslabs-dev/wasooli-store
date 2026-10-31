import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  tone = "danger",
  loading = false,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    if (!open) return;

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

  if (!open) return null;

  return (
    <div
      onClick={loading ? undefined : onClose}
      className={`fixed inset-0 z-[70] grid place-items-center bg-slate-900/45 p-4 backdrop-blur-xs transition-opacity ${
        loading ? "cursor-wait" : ""
      }`}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-white p-5 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-10 items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition ${
              loading
                ? "cursor-wait opacity-85"
                : "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            } ${
              tone === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : tone === "success"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-brand-500 hover:bg-brand-600"
            }`}
          >
            {loading && <Loader2 size={16} className="animate-spin shrink-0" />}
            <span>{loading ? `${confirmLabel}...` : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
