import { z } from "zod";
import { jakartaDateBoundary, parseJakartaDateTime } from "@/lib/dates/jakarta";
import { moneyString } from "@/lib/money/schema";
import { optionalNoteSchema } from "@/lib/validation/note";

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
    amount: moneyString({
      formatMessage: "Jumlah transfer harus rupiah bulat positif.",
      rangeMessage: "Jumlah transfer melewati batas yang didukung.",
    }),
    transferredAt: transferredAtSchema,
    note: optionalNoteSchema,
  })
  .refine((value) => value.sourceAccountId !== value.destinationAccountId, {
    message: "Akun sumber dan tujuan harus berbeda.",
    path: ["destinationAccountId"],
  });
