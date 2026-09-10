import { z } from "zod";

export const friendNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be 100 characters or less");

export const friendIdSchema = z.string().uuid();
