import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { SplitBillCalculationResult } from "../types/split-bill";
import { CalculationSummary } from "./calculation-summary";
import { SplitBillList } from "./split-bill-list";

const result: SplitBillCalculationResult = {
  calculationVersion: 1,
  subtotalAmount: 20_000n,
  discountAmount: 2_000n,
  discountedSubtotalAmount: 18_000n,
  itemTaxAmount: 900n,
  billTaxAmount: 900n,
  totalTaxAmount: 1_800n,
  serviceChargeAmount: 1_800n,
  finalAmount: 21_600n,
  items: [],
  assignments: [],
  participants: [
    {
      participantId: "a",
      name: "Ayu",
      position: 1,
      itemAmount: 9_000n,
      itemTaxAmount: 900n,
      billTaxAmount: 0n,
      serviceChargeAmount: 900n,
      finalAmount: 10_800n,
    },
    {
      participantId: "b",
      name: "Bima",
      position: 2,
      itemAmount: 9_000n,
      itemTaxAmount: 0n,
      billTaxAmount: 900n,
      serviceChargeAmount: 900n,
      finalAmount: 10_800n,
    },
  ],
};

describe("split-bill components", () => {
  it("labels browser calculation as a non-authoritative preview", () => {
    render(<CalculationSummary result={result} />);
    expect(screen.getByText("Pratinjau lokal")).toBeInTheDocument();
    expect(screen.getByText(/bukan nilai final/i)).toBeInTheDocument();
    expect(screen.getByText(/21\.600/u)).toBeInTheDocument();
    expect(screen.getAllByText(/10\.800/u)).toHaveLength(2);
  });

  it("renders deterministic history status and private detail links", () => {
    render(
      <SplitBillList
        rows={[
          {
            id: "00000000-0000-4000-8000-000000000001",
            merchantName: "Warung",
            billDate: "2026-08-05",
            status: "finalized",
            finalAmount: "21600",
            participantCount: 2,
          },
        ]}
        total={1}
        totalPages={1}
        filters={{ q: "", page: 1, pageSize: 20 }}
      />,
    );
    expect(screen.getByText("Final")).toBeInTheDocument();
    expect(screen.getByText("2 peserta")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lihat hasil" })).toHaveAttribute(
      "href",
      "/split-bills/00000000-0000-4000-8000-000000000001",
    );
    expect(
      screen.getByRole("navigation", { name: "Paginasi tagihan patungan" }),
    ).toBeInTheDocument();
  });
});
