import { describe, expect, it } from "vitest";
import { optionalNoteSchema } from "./note";

describe("optionalNoteSchema", () => {
  it("trims whitespace and keeps non-empty notes", () => {
    expect(optionalNoteSchema.parse("  makan siang  ")).toBe("makan siang");
  });

  it("turns empty or whitespace-only notes into null", () => {
    expect(optionalNoteSchema.parse("")).toBeNull();
    expect(optionalNoteSchema.parse("   ")).toBeNull();
  });

  it("accepts a note up to 500 characters", () => {
    expect(optionalNoteSchema.safeParse("x".repeat(500)).success).toBe(true);
  });

  it("rejects notes over 500 characters", () => {
    expect(optionalNoteSchema.safeParse("x".repeat(501)).success).toBe(false);
  });
});