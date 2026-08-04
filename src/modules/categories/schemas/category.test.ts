import { describe, expect, it } from "vitest";
import { categorySchema } from "./category";
import { normalizeCategoryName } from "../services/normalize-category-name";

describe("category validation", () => {
  it("normalizes display whitespace and identity", () => {
    const parsed = categorySchema.parse({ name: "  Makan   Siang ", type: "expense", icon: null, color: null });
    expect(parsed.name).toBe("Makan Siang");
    expect(normalizeCategoryName(parsed.name)).toBe("makan siang");
  });

  it("normalizes compatible unicode forms", () => {
    expect(normalizeCategoryName("Ｋａｎｔｏｒ")).toBe("kantor");
  });

  it("rejects unsupported icon and color values", () => {
    expect(categorySchema.safeParse({ name: "Valid", type: "expense", icon: "script", color: "#fff" }).success).toBe(false);
  });

  it("rejects short names", () => {
    expect(categorySchema.safeParse({ name: " x ", type: "income", icon: null, color: null }).success).toBe(false);
  });
});
