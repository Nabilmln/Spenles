import { describe, expect, it } from "vitest";
import { formatIdr } from "@/lib/money/format-idr";
import { createSplitBillShareSummary } from "./share-summary";

describe("split-bill share summary", () => {
  it("formats owned snapshot data without internal identifiers", () => {
    const text = createSplitBillShareSummary({
      merchantName: "Warung",
      billDate: "2026-08-05",
      subtotalAmount: "20000",
      taxAmount: "1600",
      taxBps: 1000,
      taxMode: "percentage",
      finalAmount: "21600",
      participants: [
        {
          name: "Ayu",
          finalAmount: "11600",
          paymentStatus: "partially_paid",
          items: [
            { name: "Coto Makassar", unitPrice: "1000", quantity: 1, amount: "11600" },
          ],
        },
        {
          name: "Bima",
          finalAmount: "10000",
          paymentStatus: "paid",
          items: [
            { name: "Es Teh", unitPrice: "1000", quantity: 1, amount: "10000" },
          ],
        },
      ],
      includePaymentStatus: true,
    });
    expect(text).toContain("Split Bill — Warung");
    expect(text).toContain("5 Agustus 2026");
    expect(text).toContain("Ayu: (Dibayar sebagian)");
    expect(text).toContain("Bima: (Lunas)");
    expect(text).toContain("• Coto Makassar —");
    expect(text).toContain("• Es Teh —");
    expect(text).toContain(`Subtotal: ${formatIdr("20000")}`);
    expect(text).toContain(`Pajak 10%: ${formatIdr("1600")}`);
    expect(text).toContain(`Total: ${formatIdr("21600")}`);
    expect(text).not.toContain("user_id");
    expect(text).not.toContain("00000000-");
  });
});