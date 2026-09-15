import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { FriendRow } from "@/modules/friends";
import type { SplitBillCalculationResult } from "../types/split-bill";
import { MakeBillOverviewSheet } from "./make-bill-overview-sheet";

afterEach(cleanup);

const participants: FriendRow[] = [
  { id: "f1", name: "Nabil", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "f2", name: "Ayu", createdAt: "2026-01-01T00:00:00.000Z" },
];

const preview: SplitBillCalculationResult = {
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
      participantId: "f1",
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

describe("MakeBillOverviewSheet", () => {
  it("shows items with their assigned participants", () => {
    render(
      <MakeBillOverviewSheet
        open
        onClose={vi.fn()}
        preview={preview}
        merchantName="Warung"
        billDate="5 Agustus 2026"
        participants={participants}
        items={[
          {
            id: "i1",
            name: "Nasi Goreng",
            quantity: 1,
            unitPrice: "30000",
            participantIds: ["f1"],
          },
        ]}
        note=""
        onSaveDraft={vi.fn()}
        saving={false}
        onConfirm={vi.fn()}
        finalizing={false}
      />,
    );

    const itemCard = screen.getByTestId("overview-item-i1");
    expect(within(itemCard).getByText("Nasi Goreng")).toBeInTheDocument();
    expect(within(itemCard).getByText("Rp 30.000")).toBeInTheDocument();
    expect(within(itemCard).getByText("Nabil")).toBeInTheDocument();
    expect(within(itemCard).queryByText("Ayu")).not.toBeInTheDocument();
  });

  it("shows bill summary and description", () => {
    render(
      <MakeBillOverviewSheet
        open
        onClose={vi.fn()}
        preview={preview}
        merchantName="Warung"
        billDate="5 Agustus 2026"
        participants={participants}
        items={[]}
        note="Lunch together"
        onSaveDraft={vi.fn()}
        saving={false}
        onConfirm={vi.fn()}
        finalizing={false}
      />,
    );

    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getAllByText("Rp 30.000").length).toBeGreaterThan(0);
    expect(screen.getByText("Lunch together")).toBeInTheDocument();
  });

  it("fires the draft and confirm callbacks", () => {
    const onSaveDraft = vi.fn();
    const onConfirm = vi.fn();
    render(
      <MakeBillOverviewSheet
        open
        onClose={vi.fn()}
        preview={preview}
        merchantName="Warung"
        billDate="5 Agustus 2026"
        participants={participants}
        items={[]}
        note=""
        onSaveDraft={onSaveDraft}
        saving={false}
        onConfirm={onConfirm}
        finalizing={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save Draft" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(onSaveDraft).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});