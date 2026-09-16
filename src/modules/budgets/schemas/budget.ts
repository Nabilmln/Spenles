import { z } from "zod";
import { isDateKey } from "@/lib/dates/calendar";
import { moneyString } from "@/lib/money/schema";

export const budgetIdSchema = z.uuid();

const periodTypeSchema = z.enum(["monthly", "weekly", "custom"]);
const warningModeSchema = z.enum(["threshold", "days"]);

function nullableInt(min: number, max: number, message: string) {
  return z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().int(message).min(min, message).max(max, message).nullable(),
  );
}

export const budgetSchema = z
  .object({
    categoryId: z.uuid("Invalid category."),
    periodType: periodTypeSchema,
    periodStart: z.string(),
    periodEnd: z.string(),
    amount: moneyString({
      formatMessage: "Budget must be a positive whole number of rupiah.",
      rangeMessage: "Budget exceeds the supported limit.",
    }),
    warningMode: warningModeSchema,
    warningThresholdBps: nullableInt(
      100,
      10_000,
      "Threshold must be between 1% and 100%.",
    ),
    warningDaysRemaining: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
      z
        .number()
        .int("Days must be a whole number.")
        .refine(
          (v) => v === null || v === 1 || v === 3 || v === 5,
          "Days must be 1, 3, or 5.",
        )
        .nullable(),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.periodType === "custom") {
      if (!isDateKey(data.periodStart)) {
        ctx.addIssue({
          code: "custom",
          path: ["periodStart"],
          message: "Select a start date.",
        });
      }
      if (!isDateKey(data.periodEnd)) {
        ctx.addIssue({
          code: "custom",
          path: ["periodEnd"],
          message: "Select an end date.",
        });
      }
      if (
        data.periodStart &&
        data.periodEnd &&
        data.periodEnd < data.periodStart
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["periodEnd"],
          message: "End date must be on or after the start date.",
        });
      }
    } else if (data.periodStart !== "" || data.periodEnd !== "") {
      ctx.addIssue({
        code: "custom",
        path: ["periodType"],
        message: "Custom range is only allowed for the custom period.",
      });
    }

    const thresholdSet = data.warningThresholdBps !== null;
    const daysSet = data.warningDaysRemaining !== null;
    if (thresholdSet === daysSet) {
      ctx.addIssue({
        code: "custom",
        path: ["warningMode"],
        message: "Select either a percentage threshold or days remaining.",
      });
    }
  });

export type BudgetWarningMode = z.infer<typeof warningModeSchema>;