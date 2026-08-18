import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SplitBillEditor, type SplitBillEditorData } from "./split-bill-editor";

afterEach(cleanup);

const emptyInitial: SplitBillEditorData = {
  merchantName: "",
  billDate: "2026-08-01",
  note: "",
  discountMode: "none",
  fixedDiscountAmount: "0",
  discountBps: 0,
  billTaxBps: 0,
  serviceChargeBps: 0,
  participants: [],
  items: [],
};

const action = async () => ({});
const finalizeAction = async () => ({});
const deleteAction = async () => {};

describe("SplitBillEditor", () => {
  it("asks for participants before showing the item form", () => {
    render(
      <SplitBillEditor
        action={action}
        finalizeAction={finalizeAction}
        initial={emptyInitial}
      />,
    );

    expect(
      screen.getByText(
        "Tambahkan peserta terlebih dahulu untuk mulai memasukkan item.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tambah item" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Pajak (%)")).toHaveValue(0);
  });

  it("reveals the item section once a participant is added", () => {
    render(
      <SplitBillEditor
        action={action}
        finalizeAction={finalizeAction}
        initial={emptyInitial}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Tambah peserta" }));

    expect(
      screen.queryByText(
        "Tambahkan peserta terlebih dahulu untuk mulai memasukkan item.",
      ),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Peserta 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tambah item" })).toBeInTheDocument();
  });

  it("offers Draft, Finalisasi, and Hapus for an existing draft", () => {
    render(
      <SplitBillEditor
        action={action}
        deleteAction={deleteAction}
        finalizeAction={finalizeAction}
        initial={{
          ...emptyInitial,
          id: "00000000-0000-4000-8000-000000000001",
          revision: 0,
          participants: [{ id: "p1", name: "Nabil" }],
          items: [
            {
              id: "i1",
              name: "Nasi Goreng",
              quantity: 1,
              unitPrice: "30000",
              itemTaxBps: 0,
              participantIds: ["p1"],
            },
          ],
        }}
      />,
    );

    expect(screen.getByRole("button", { name: "Draft" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Final" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hapus" })).toBeInTheDocument();
  });
});
