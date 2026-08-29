const NON_DIGITS = /\D/gu;

/**
 * Strips everything except digits from a raw input value.
 * "Rp1.000" -> "1000", "02" -> "02".
 */
export function digitsOnly(value: string) {
  return value.replace(NON_DIGITS, "");
}

/**
 * Strips leading zeros while preserving a single "0".
 * "02" -> "2", "0" -> "0", "000100" -> "100".
 */
export function stripLeadingZeros(value: string) {
  const digits = digitsOnly(value);
  if (digits === "") return "";
  return digits.replace(/^0+(?=\d)/u, "");
}

/**
 * Formats digit characters with the Indonesian thousands separator.
 * "1000000" -> "1.000.000". Non-digit input is stripped first.
 */
export function formatThousands(value: string) {
  const digits = digitsOnly(value);
  if (digits === "") return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/gu, ".");
}

/**
 * Parses a formatted display value back into the canonical digit string.
 * "Rp1.000" -> "1000", "1.000" -> "1000", "02" -> "02".
 */
export function parseMoneyInput(value: string) {
  return digitsOnly(value);
}

/**
 * Computes the unit price (rupiah) from a total price and quantity.
 * Returns the exact quotient when divisible, otherwise null so the caller
 * can decide how to surface the rounding requirement instead of silently
 * changing the financial result.
 */
export function unitPriceFromTotal(total: bigint, quantity: number) {
  if (quantity <= 0) return null;
  const qty = BigInt(quantity);
  if (total % qty !== 0n) return null;
  return total / qty;
}