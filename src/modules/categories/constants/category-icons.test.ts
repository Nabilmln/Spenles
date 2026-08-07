import { describe, expect, it } from "vitest";
import {
  CATEGORY_ICON_LIBRARY,
  CATEGORY_ICON_NAMES,
  resolveCategoryIcon,
  stableCategoryHash,
} from "./category-icons";

describe("category icon fallback", () => {
  it("renders the explicitly selected icon when present", () => {
    const Icon = resolveCategoryIcon("id-1", "Makanan", "utensils");
    expect(Icon).toBe(CATEGORY_ICON_LIBRARY.utensils);
  });

  it("falls back to an icon within the approved library for null icon", () => {
    const Icon = resolveCategoryIcon("id-1", "Makanan", null);
    expect(CATEGORY_ICON_NAMES).toContain(
      Object.keys(CATEGORY_ICON_LIBRARY).find((name) => CATEGORY_ICON_LIBRARY[name] === Icon),
    );
  });

  it("is deterministic for the same category across renders", () => {
    const a = resolveCategoryIcon("id-7", "Transportasi", null);
    const b = resolveCategoryIcon("id-7", "Transportasi", null);
    expect(a).toBe(b);
  });

  it("hashes stably regardless of case", () => {
    expect(stableCategoryHash("id", "Makan")).toBe(stableCategoryHash("id", "makan"));
  });

  it("differs by category id", () => {
    expect(stableCategoryHash("a", "Makan")).not.toBe(stableCategoryHash("b", "Makan"));
  });
});