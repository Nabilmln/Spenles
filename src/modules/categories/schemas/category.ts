import { z } from "zod";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../constants/category-options";
import { normalizeCategoryDisplayName } from "../services/normalize-category-name";

export const categorySchema = z.object({
  name: z.string().transform(normalizeCategoryDisplayName).pipe(
    z.string().min(2, "Name must be at least 2 characters.").max(80, "Name must be at most 80 characters."),
  ),
  type: z.enum(["income", "expense"]),
  icon: z.enum(CATEGORY_ICONS).nullable(),
  color: z.enum(CATEGORY_COLORS).nullable(),
});

export const categoryIdSchema = z.uuid();
