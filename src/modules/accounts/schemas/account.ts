import { z } from "zod";
import { MAX_TRANSACTION_AMOUNT } from "@/lib/money/format-idr";

const moneyString = z
  .string()
  .trim()
  .regex(/^\d+$/u, "Nilai harus berupa rupiah bulat.")
  .refine(
    (value) =>
      /^\d+$/u.test(value) && BigInt(value) <= MAX_TRANSACTION_AMOUNT,
    {
    message: "Nilai melewati batas yang didukung.",
    },
  );

export const accountIdSchema = z.uuid();

export const accountSchema = z.object({
  name: z.string().trim().min(1, "Nama akun wajib diisi.").max(80),
  type: z.enum(["cash", "bank", "e_wallet", "savings", "other"]),
  openingBalance: moneyString,
});

export type AccountInput = z.infer<typeof accountSchema>;
