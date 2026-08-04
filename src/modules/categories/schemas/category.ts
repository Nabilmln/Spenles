import { z } from "zod";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../constants/category-options";
import { normalizeCategoryDisplayName } from "../services/normalize-category-name";

export const categorySchema = z.object({
  name: z.string().transform(normalizeCategoryDisplayName).pipe(
    z.string().min(2, "Nama minimal 2 karakter.").max(80, "Nama maksimal 80 karakter."),
  ),
  type: z.enum(["income", "expense"]),
  icon: z.enum(CATEGORY_ICONS).nullable(),
  color: z.enum(CATEGORY_COLORS).nullable(),
});

export const categoryIdSchema = z.uuid();
