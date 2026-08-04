import { z } from "zod";

export const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter.")
    .max(100, "Nama maksimal 100 karakter."),
  defaultCurrency: z.literal("IDR"),
  timezone: z.literal("Asia/Jakarta"),
  theme: z.enum(["system", "light", "dark"]),
});

export const themeSchema = profileSchema.shape.theme;
