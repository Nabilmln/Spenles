import { z } from "zod";
import { moneyString } from "@/lib/money/schema";
import { optionalNoteSchema } from "@/lib/validation/note";

export const recurringRuleIdSchema = z.uuid();

export const recurringRuleSchema = z
  .object({
    type: z.enum(["income", "expense"]),
    amount: moneyString({
      formatMessage: "Amount must be a positive whole number of rupiah.",
      rangeMessage: "Amount exceeds the supported limit.",
    }),
    accountId: z.uuid("Invalid account."),
    categoryId: z.uuid("Invalid category."),
    frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
    startAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/u, "Invalid start time."),
    endDate: z
      .union([
        z.literal(""),
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/u, "Invalid end date."),
      ])
      .transform((value) => value || null),
    note: optionalNoteSchema,
  })
  .superRefine((value, context) => {
    if (value.endDate && value.endDate < value.startAt.slice(0, 10)) {
      context.addIssue({
        code: "custom",
        message: "End date cannot be before the start date.",
        path: ["endDate"],
      });
    }
  });
