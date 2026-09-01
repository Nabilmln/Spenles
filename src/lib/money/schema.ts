import { z } from "zod";
import { MAX_TRANSACTION_AMOUNT } from "./format-idr";

type MoneyStringOptions = {
  allowZero?: boolean;
  allowLeadingZeros?: boolean;
  max?: bigint;
  formatMessage?: string;
  rangeMessage?: string;
};

export function moneyString(options: MoneyStringOptions = {}) {
  const {
    allowZero = false,
    allowLeadingZeros = false,
    max = MAX_TRANSACTION_AMOUNT,
    formatMessage = "Amount must be a whole rupiah.",
    rangeMessage = "Amount is outside the supported range.",
  } = options;
  const digits = allowZero || allowLeadingZeros ? /^\d+$/u : /^[1-9]\d*$/u;
  return z
    .string()
    .trim()
    .regex(digits, formatMessage)
    .refine(
      (value) => {
        if (!digits.test(value)) return false;
        const amount = BigInt(value);
        return amount <= max && (allowZero || amount > 0n);
      },
      { message: rangeMessage },
    );
}