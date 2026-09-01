import { z } from "zod";
import { moneyString } from "@/lib/money/schema";

export const accountIdSchema = z.uuid();

export const accountSchema = z.object({
  name: z.string().trim().min(1, "Account name is required.").max(80),
  type: z.enum(["cash", "bank", "e_wallet", "savings", "other"]),
  openingBalance: moneyString({
    allowZero: true,
    formatMessage: "Value must be a whole number of rupiah.",
    rangeMessage: "Value exceeds the supported limit.",
  }),
});

export type AccountInput = z.infer<typeof accountSchema>;
