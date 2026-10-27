/**
 * Locked leave-demo password rules (aligned with API PasswordPolicy).
 * Min 8; digit + lowercase + uppercase; non-alphanumeric not required.
 */
export const PASSWORD_HINT =
  "Use at least 8 characters with a digit, lowercase, and uppercase letter.";

export function passwordPolicyError(password) {
  const value = String(password || "");
  if (value.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (!/[a-z]/.test(value)) {
    return "Password must include a lowercase letter.";
  }
  if (!/[A-Z]/.test(value)) {
    return "Password must include an uppercase letter.";
  }
  if (!/\d/.test(value)) {
    return "Password must include a digit.";
  }
  return "";
}
