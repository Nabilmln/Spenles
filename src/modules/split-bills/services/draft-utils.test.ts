import { describe, expect, it } from "vitest";
import { createId, percentageToBasisPoints } from "./draft-utils";

describe("draft-utils", () => {
  describe("createId", () => {
    it("produces a UUID", () => {
      expect(createId()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u,
      );
    });

    it("produces unique ids", () => {
      expect(createId()).not.toBe(createId());
    });
  });

  describe("percentageToBasisPoints", () => {
    it("converts a whole percentage", () => {
      expect(percentageToBasisPoints("10")).toBe(1000);
      expect(percentageToBasisPoints("0")).toBe(0);
      expect(percentageToBasisPoints("100")).toBe(10000);
    });

    it("converts a fractional percentage to two decimal digits", () => {
      expect(percentageToBasisPoints("10.5")).toBe(1050);
      expect(percentageToBasisPoints("0.05")).toBe(5);
      expect(percentageToBasisPoints("12.34")).toBe(1234);
    });

    it("pads a single fractional digit", () => {
      expect(percentageToBasisPoints("7.5")).toBe(750);
    });

    it("returns zero for an unrecognized value", () => {
      expect(percentageToBasisPoints("")).toBe(0);
      expect(percentageToBasisPoints("abc")).toBe(0);
      expect(percentageToBasisPoints("10.123")).toBe(0);
      expect(percentageToBasisPoints("-5")).toBe(0);
    });

    it("caps the whole part at three digits", () => {
      expect(percentageToBasisPoints("999")).toBe(99900);
      expect(percentageToBasisPoints("1000")).toBe(0);
    });
  });
});