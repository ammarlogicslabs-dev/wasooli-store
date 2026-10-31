import { useEffect } from "react";
import { X } from "lucide-react";

export default function AdminModal({
  open,
  title,
  onClose,
  children,
  wide = false,
  maxWidth = "",
}) {
  useEffect(() => {
    if (!open) return;

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

  if (!open) return null;

  const widthClass = maxWidth || (wide ? "sm:max-w-3xl" : "sm:max-w-lg");

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/45 sm:items-center sm:p-4 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[92vh] w-full overflow-y-auto custom-scrollbar rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl ${widthClass}`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 cursor-pointer place-items-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
