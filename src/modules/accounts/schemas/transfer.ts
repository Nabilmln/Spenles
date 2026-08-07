import { z } from "zod";
import { jakartaDateBoundary, parseJakartaDateTime } from "@/lib/dates/jakarta";
import { MAX_TRANSACTION_AMOUNT } from "@/lib/money/format-idr";

export const transferIdSchema = z.uuid();

export const transferredAtSchema = z.string().refine((value) => {
  if (/^\d{4}-\d{2}-\d{2}$/u.test(value)) return jakartaDateBoundary(value) !== null;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/u.test(value)) return parseJakartaDateTime(value) !== null;
  return false;
}, "Waktu transfer tidak valid.");

export const transferSchema = z
  .object({
    sourceAccountId: z.uuid("Akun sumber tidak valid."),
    destinationAccountId: z.uuid("Akun tujuan tidak valid."),
    amount: z
      .string()
      .trim()
      .regex(/^[1-9]\d*$/u, "Jumlah transfer harus rupiah bulat positif.")
      .refine((value) => /^[1-9]\d*$/u.test(value) && BigInt(value) <= MAX_TRANSACTION_AMOUNT, {
        message: "Jumlah transfer melewati batas yang didukung.",
      }),
    transferredAt: transferredAtSchema,
    note: z
      .string()
      .trim()
      .max(500, "Catatan maksimal 500 karakter.")
      .transform((value) => value || null),
  })
  .refine((value) => value.sourceAccountId !== value.destinationAccountId, {
    message: "Akun sumber dan tujuan harus berbeda.",
    path: ["destinationAccountId"],
  });
