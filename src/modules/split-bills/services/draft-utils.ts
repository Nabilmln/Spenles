/**
 * Shared pure draft utilities used by the split-bill create flow and editor.
 * They are environment- and UI-agnostic so both client flows stay identical.
 */

export function createId() {
  return crypto.randomUUID();
}

export function percentageToBasisPoints(value: string) {
  const match = /^(\d{0,3})(?:\.(\d{0,2}))?$/u.exec(value);
  if (!match) return 0;
  const whole = Number(match[1] || "0");
  const fraction = Number((match[2] ?? "").padEnd(2, "0"));
  return whole * 100 + fraction;
}