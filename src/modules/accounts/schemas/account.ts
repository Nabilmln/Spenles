import { z } from "zod";
import { moneyString } from "@/lib/money/schema";

export const accountIdSchema = z.uuid();

export const accountSchema = z.object({
  name: z.string().trim().min(1, "Nama akun wajib diisi.").max(80),
  type: z.enum(["cash", "bank", "e_wallet", "savings", "other"]),
  openingBalance: moneyString({
    allowZero: true,
    formatMessage: "Nilai harus berupa rupiah bulat.",
    rangeMessage: "Nilai melewati batas yang didukung.",
  }),
});

export type AccountInput = z.infer<typeof accountSchema>;
