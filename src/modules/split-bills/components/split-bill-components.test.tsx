import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { SplitBillCalculationResult } from "../types/split-bill";
import { CalculationSummary } from "./calculation-summary";

afterEach(cleanup);

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
    expect(screen.getByText("Local preview")).toBeInTheDocument();
    expect(screen.getByText(/not the final value/i)).toBeInTheDocument();
    expect(screen.getByText(/21\.600/u)).toBeInTheDocument();
    expect(screen.getAllByText(/10\.800/u)).toHaveLength(2);
  });
});
