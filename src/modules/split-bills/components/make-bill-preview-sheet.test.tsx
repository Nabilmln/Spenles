import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SplitBillCalculationResult } from "../types/split-bill";
import { createShareSummaryAction } from "../actions/split-bill-actions";
import { MakeBillPreviewSheet } from "./make-bill-preview-sheet";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("../actions/split-bill-actions", () => ({
  createShareSummaryAction: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  pushMock.mockReset();
});

const result: SplitBillCalculationResult = {
  calculationVersion: 1,
  subtotalAmount: 30000n,
  discountAmount: 0n,
  discountedSubtotalAmount: 30000n,
  itemTaxAmount: 0n,
  billTaxAmount: 0n,
  totalTaxAmount: 0n,
  serviceChargeAmount: 0n,
  finalAmount: 30000n,
  items: [],
  assignments: [],
  participants: [
    {
      participantId: "p1",
      name: "Nabil",
      position: 1,
      itemAmount: 30000n,
      itemTaxAmount: 0n,
      billTaxAmount: 0n,
      serviceChargeAmount: 0n,
      finalAmount: 30000n,
    },
  ],
};

describe("MakeBillPreviewSheet", () => {
  it("copies the share summary to the clipboard", async () => {
    const action = vi
      .mocked(createShareSummaryAction)
      .mockResolvedValue({ success: "Summary ready to copy.", text: "Split Bill — Warung" });
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    render(
      <MakeBillPreviewSheet
        open
        onClose={vi.fn()}
        result={result}
        merchantName="Warung"
        billDate="5 Agustus 2026"
        finalizedId="00000000-0000-4000-8000-000000000001"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy to Clipboard" }));

    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "Split Bill — Warung",
      ),
    );
    await screen.findByText("Split Bill copied to clipboard.");
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("navigates to the result page on View Result", () => {
    render(
      <MakeBillPreviewSheet
        open
        onClose={vi.fn()}
        result={result}
        merchantName="Warung"
        billDate="5 Agustus 2026"
        finalizedId="00000000-0000-4000-8000-000000000001"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "View Result" }));

    expect(pushMock).toHaveBeenCalledWith(
      "/split-bills/00000000-0000-4000-8000-000000000001",
    );
  });

  it("displays the final total and participant obligations", () => {
    render(
      <MakeBillPreviewSheet
        open
        onClose={vi.fn()}
        result={result}
        merchantName="Warung"
        billDate="5 Agustus 2026"
        finalizedId="00000000-0000-4000-8000-000000000001"
      />,
    );

    expect(screen.getByText("Final total")).toBeInTheDocument();
    expect(screen.getByText("Nabil")).toBeInTheDocument();
  });
});