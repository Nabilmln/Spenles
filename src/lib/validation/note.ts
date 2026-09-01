import { z } from "zod";

export const optionalNoteSchema = z
  .string()
  .trim()
  .max(500, "Note must be at most 500 characters.")
  .transform((value) => value || null);