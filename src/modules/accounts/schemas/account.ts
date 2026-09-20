import { z } from "zod";
import { moneyString } from "@/lib/money/schema";
import { ACCOUNT_TYPE_VALUES } from "../constants/account-types";

export const accountIdSchema = z.uuid();

export const accountSchema = z.object({
  name: z.string().trim().min(1, "Account name is required.").max(80),
  type: z.enum(ACCOUNT_TYPE_VALUES),
  openingBalance: moneyString({
    allowZero: true,
    formatMessage: "Value must be a whole number of rupiah.",
    rangeMessage: "Value exceeds the supported limit.",
  }),
});

export type AccountInput = z.infer<typeof accountSchema>;
