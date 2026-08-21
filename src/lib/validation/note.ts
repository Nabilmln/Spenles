import { z } from "zod";

export const optionalNoteSchema = z
  .string()
  .trim()
  .max(500, "Catatan maksimal 500 karakter.")
  .transform((value) => value || null);