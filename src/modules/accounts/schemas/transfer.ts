import { z } from "zod";
import { jakartaDateBoundary, parseJakartaDateTime } from "@/lib/dates/jakarta";
import { moneyString } from "@/lib/money/schema";
import { optionalNoteSchema } from "@/lib/validation/note";

export const transferIdSchema = z.uuid();

export const transferredAtSchema = z.string().refine((value) => {
  if (/^\d{4}-\d{2}-\d{2}$/u.test(value)) return jakartaDateBoundary(value) !== null;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/u.test(value)) return parseJakartaDateTime(value) !== null;
  return false;
}, "Transfer time is invalid.");

export const transferSchema = z
  .object({
    sourceAccountId: z.uuid("Source account is invalid."),
    destinationAccountId: z.uuid("Destination account is invalid."),
    amount: moneyString({
      formatMessage: "Transfer amount must be a positive whole number of rupiah.",
      rangeMessage: "Transfer amount exceeds the supported limit.",
    }),
    transferredAt: transferredAtSchema,
    note: optionalNoteSchema,
  })
  .refine((value) => value.sourceAccountId !== value.destinationAccountId, {
    message: "Source and destination accounts must be different.",
    path: ["destinationAccountId"],
  });
