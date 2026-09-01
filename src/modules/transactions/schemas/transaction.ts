import { z } from "zod";
import { jakartaDateBoundary, jakartaNowDate } from "@/lib/dates/jakarta";
import { moneyString } from "@/lib/money/schema";
import { optionalNoteSchema } from "@/lib/validation/note";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: moneyString({
    allowLeadingZeros: true,
    formatMessage: "Amount must be a whole rupiah.",
    rangeMessage: "Amount must be greater than zero and within the supported range.",
  }),
  accountId: z.uuid("Invalid account."),
  categoryId: z.uuid("Invalid category."),
  transactionAt: z.string().refine((value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return false;
    if (!jakartaDateBoundary(value)) return false;
    return value <= jakartaNowDate();
  }, "Transaction date is invalid or in the future."),
  note: optionalNoteSchema,
});

export const transactionIdSchema = z.uuid();
