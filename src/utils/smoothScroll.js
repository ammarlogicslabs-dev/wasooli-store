export const PROGRAMMATIC_SCROLL_EVENT = "wasooli:programmatic-scroll";

/** Smooth-scroll to a section without the sticky header auto-hiding mid-scroll. */
export function smoothScrollTo(target, { reduce = false, block = "start", offset = -80 } = {}) {
  const el =
    typeof target === "string" ? document.getElementById(target) : target;
  if (!el) return;

  window.dispatchEvent(
    new CustomEvent(PROGRAMMATIC_SCROLL_EVENT, {
      detail: { durationMs: reduce ? 0 : 1600 },
    })
  );

  if (window.__lenis && !reduce) {
    window.__lenis.scrollTo(el, { offset, duration: 1.2 });
    return;
  }

  el.scrollIntoView({
    behavior: reduce ? "auto" : "smooth",
    block,
  });
}
