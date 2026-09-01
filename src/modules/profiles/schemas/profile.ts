import { z } from "zod";
import { JAKARTA_TIMEZONE } from "@/lib/dates/jakarta";

export const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters.")
    .max(100, "Display name must be at most 100 characters."),
  defaultCurrency: z.literal("IDR"),
  timezone: z.literal(JAKARTA_TIMEZONE),
  theme: z.enum(["system", "light", "dark"]),
});

export const themeSchema = profileSchema.shape.theme;
