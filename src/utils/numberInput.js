/**
 * Utilities for text-based numeric inputs across Wasooli Store.
 * Keeps input type="text" (no ugly browser spinners/arrows) while strictly
 * restricting input to numbers only (integers or decimals).
 */

/**
 * Sanitizes an input string so it contains only valid numeric characters.
 *
 * @param {string|number} value - The input value to clean.
 * @param {Object} [options]
 * @param {boolean} [options.allowDecimal=false] - Whether a decimal point is permitted.
 * @param {number} [options.maxDecimals] - Optional maximum decimal places.
 * @returns {string} Sanitized string containing only digits (and optionally one decimal point).
 */
export function sanitizeNumber(value, { allowDecimal = false, maxDecimals } = {}) {
  if (value == null) return "";
  let str = String(value);

  if (allowDecimal) {
    // Keep only digits and dots
    str = str.replace(/[^0-9.]/g, "");
    // Keep only the first dot
    const parts = str.split(".");
    if (parts.length > 2) {
      str = parts[0] + "." + parts.slice(1).join("");
    }
    if (maxDecimals != null && parts.length === 2 && parts[1].length > maxDecimals) {
      str = parts[0] + "." + parts[1].slice(0, maxDecimals);
    }
    return str;
  }

  // Integer only: digits only
  return str.replace(/\D/g, "");
}

/**
 * onKeyDown keyboard event handler that prevents any non-numeric key from being entered.
 * Allows navigation/system keys (Backspace, Delete, Tab, Arrows, Enter, Ctrl/Cmd shortcuts).
 *
 * @param {React.KeyboardEvent} event
 * @param {Object} [options]
 * @param {boolean} [options.allowDecimal=false] - Whether to allow a single decimal point.
 */
export function filterNumericKeyDown(event, { allowDecimal = false } = {}) {
  // Allow Ctrl / Cmd combinations (Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z, etc.)
  if (event.ctrlKey || event.metaKey) {
    return;
  }

  // Allow standard editing and navigation keys
  if (
    [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ].includes(event.key)
  ) {
    return;
  }

  // Decimal point handling: only allow '.' if allowDecimal is true and input doesn't already contain one
  if (allowDecimal && (event.key === "." || event.key === "Decimal")) {
    const val = String(event.currentTarget.value || "");
    const selectionStart = event.currentTarget.selectionStart ?? 0;
    const selectionEnd = event.currentTarget.selectionEnd ?? 0;
    const hasDot = val.includes(".");
    const selectedText = val.slice(selectionStart, selectionEnd);
    if (hasDot && !selectedText.includes(".")) {
      event.preventDefault();
    }
    return;
  }

  // Digits 0-9
  if (/^[0-9]$/.test(event.key)) {
    return;
  }

  // Reject all other keys (letters, symbols, e, E, +, -, etc.)
  event.preventDefault();
}

