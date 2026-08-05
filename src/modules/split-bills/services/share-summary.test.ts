import { describe, expect, it } from "vitest";
import { formatIdr } from "@/lib/money/format-idr";
import { createSplitBillShareSummary } from "./share-summary";

describe("split-bill share summary", () => {
  it("formats owned snapshot data without internal identifiers", () => {
    const text = createSplitBillShareSummary({
      merchantName: "Warung",
      billDate: "2026-08-05",
      finalAmount: "21600",
      participants: [
        {
          name: "Ayu",
          finalAmount: "10800",
          paymentStatus: "partially_paid",
        },
        {
          name: "Bima",
          finalAmount: "10800",
          paymentStatus: "paid",
        },
      ],
      includePaymentStatus: true,
    });
    expect(text).toContain("Patungan Warung");
    expect(text).toContain(formatIdr("21600"));
    expect(text).toContain("Dibayar sebagian");
    expect(text).toContain("Lunas");
    expect(text).not.toContain("user_id");
    expect(text).not.toContain("00000000-");
  });
});
