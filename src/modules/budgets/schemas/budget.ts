import { z } from "zod";
import { isCanonicalMonth } from "@/lib/dates/jakarta-month";
import { moneyString } from "@/lib/money/schema";

export const budgetIdSchema = z.uuid();

export const budgetSchema = z.object({
  categoryId: z.uuid("Invalid category."),
  month: z.string().refine(isCanonicalMonth, "Invalid budget month."),
  amount: moneyString({
    formatMessage: "Budget must be a positive whole number of rupiah.",
    rangeMessage: "Budget exceeds the supported limit.",
  }),
  warningThresholdBps: z.coerce
    .number()
    .int()
    .min(100, "Minimum threshold is 1%.")
    .max(10_000, "Maximum threshold is 100%."),
});
