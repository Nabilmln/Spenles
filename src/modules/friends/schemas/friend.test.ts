import { describe, expect, it } from "vitest";
import { friendAvatarIndexSchema } from "./friend";

describe("friend avatar choice", () => {
  it("accepts only the five bundled portraits from form data", () => {
    for (const choice of ["1", "2", "3", "4", "5"]) {
      expect(friendAvatarIndexSchema.parse(choice)).toBe(Number(choice));
    }
    for (const choice of ["0", "6", "1.5", "portrait.png", ""]) {
      expect(friendAvatarIndexSchema.safeParse(choice).success).toBe(false);
    }
  });
});
