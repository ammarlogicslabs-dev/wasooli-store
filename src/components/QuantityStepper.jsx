import { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";

const SIZES = {
  sm: {
    wrap: "flex h-8 items-center rounded-lg border border-slate-200 bg-white",
    btn: "grid size-8 place-items-center text-slate-600 transition hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-30",
    input: "w-10 min-w-0 border-0 bg-transparent p-0 text-center text-sm font-semibold text-slate-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    icon: 14,
  },
  lg: {
    wrap: "flex h-11 shrink-0 items-center rounded-3xl border border-slate-200 bg-white sm:h-13",
    btn: "grid size-9 cursor-pointer place-items-center text-slate-600 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-30 sm:size-11",
    input: "w-12 min-w-0 border-0 bg-transparent p-0 text-center text-sm font-semibold text-slate-900 outline-none sm:w-14 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    icon: 16,
  },
};

function clampQty(value, min, max) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = Infinity,
  size = "sm",
  disabled = false,
  label = "Quantity",
  className = "",
}) {
  const styles = SIZES[size] || SIZES.sm;
  const safeMax = Number.isFinite(max) && max > 0 ? max : Infinity;
  const [draft, setDraft] = useState(String(value));
  const focusedRef = useRef(false);

  useEffect(() => {
    if (!focusedRef.current) setDraft(String(value));
  }, [value]);

  function emit(next) {
    if (next !== value) onChange(next);
  }

  function handleChange(event) {
    const next = event.target.value.replace(/[^\d]/g, "");
    setDraft(next);
    if (next === "") return;
    emit(clampQty(next, min, safeMax));
  }

  function handleBlur() {
    focusedRef.current = false;
    const next = clampQty(draft === "" ? min : draft, min, safeMax);
    setDraft(String(next));
    emit(next);
  }

  function handleFocus() {
    focusedRef.current = true;
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    }
  }

  return (
    <div className={`${styles.wrap} ${className}`.trim()}>
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={() => emit(clampQty(value - 1, min, safeMax))}
        aria-label={`Decrease ${label}`}
        className={styles.btn}
      >
        <Minus size={styles.icon} />
      </button>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={draft}
        disabled={disabled}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        aria-label={label}
        className={styles.input}
      />

      <button
        type="button"
        disabled={disabled || value >= safeMax}
        onClick={() => emit(clampQty(value + 1, min, safeMax))}
        aria-label={`Increase ${label}`}
        className={styles.btn}
      >
        <Plus size={styles.icon} />
      </button>
    </div>
  );
}
