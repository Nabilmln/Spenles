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
  billTaxMode: "percentage",
  fixedBillTaxAmount: "0",
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
        "Add a participant first to start entering items.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add item" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Tax (%)")).toHaveValue(0);
  });

  it("reveals the item section once a participant is added", () => {
    render(
      <SplitBillEditor
        action={action}
        finalizeAction={finalizeAction}
        initial={emptyInitial}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add participant" }));

    expect(
      screen.queryByText(
        "Add a participant first to start entering items.",
      ),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Participant 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add item" })).toBeInTheDocument();
  });

  it("offers Save draft, Finalize, and Delete for an existing draft", () => {
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

    expect(screen.getByRole("button", { name: "Save draft" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Finalize" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("formats the unit price with an Rp prefix", () => {
    render(
      <SplitBillEditor
        action={action}
        finalizeAction={finalizeAction}
        initial={{
          ...emptyInitial,
          participants: [{ id: "p1", name: "Nabil" }],
          items: [
            {
              id: "i1",
              name: "Nasi Goreng",
              quantity: 2,
              unitPrice: "30000",
              itemTaxBps: 0,
              participantIds: ["p1"],
            },
          ],
        }}
      />,
    );

    const price = screen.getByLabelText("Unit price") as HTMLInputElement;
    expect(price.value).toBe("30.000");
  });

  it("derives the unit price from a divisible total price", () => {
    render(
      <SplitBillEditor
        action={action}
        finalizeAction={finalizeAction}
        initial={{
          ...emptyInitial,
          participants: [{ id: "p1", name: "Nabil" }],
          items: [
            {
              id: "i1",
              name: "Nasi Goreng",
              quantity: 2,
              unitPrice: "25000",
              itemTaxBps: 0,
              participantIds: ["p1"],
            },
          ],
        }}
      />,
    );

    const total = screen.getByLabelText("Total price") as HTMLInputElement;
    expect(total.value).toBe("50.000");

    fireEvent.change(total, { target: { value: "Rp100.000" } });
    const price = screen.getByLabelText("Unit price") as HTMLInputElement;
    expect(price.value).toBe("50.000");
  });

  it("rejects a total price that is not divisible by the quantity", () => {
    render(
      <SplitBillEditor
        action={action}
        finalizeAction={finalizeAction}
        initial={{
          ...emptyInitial,
          participants: [{ id: "p1", name: "Nabil" }],
          items: [
            {
              id: "i1",
              name: "Nasi Goreng",
              quantity: 2,
              unitPrice: "25000",
              itemTaxBps: 0,
              participantIds: ["p1"],
            },
          ],
        }}
      />,
    );

    const total = screen.getByLabelText("Total price") as HTMLInputElement;
    fireEvent.change(total, { target: { value: "Rp50.001" } });

    expect(screen.getByRole("alert")).toHaveTextContent(/divide evenly/i);
    const price = screen.getByLabelText("Unit price") as HTMLInputElement;
    expect(price.value).toBe("25.000");
  });

  it("does not keep a leading zero in the quantity input", () => {
    render(
      <SplitBillEditor
        action={action}
        finalizeAction={finalizeAction}
        initial={{
          ...emptyInitial,
          participants: [{ id: "p1", name: "Nabil" }],
          items: [
            {
              id: "i1",
              name: "Nasi Goreng",
              quantity: 1,
              unitPrice: "1000",
              itemTaxBps: 0,
              participantIds: ["p1"],
            },
          ],
        }}
      />,
    );

    const quantity = screen.getByLabelText("Quantity") as HTMLInputElement;
    fireEvent.change(quantity, { target: { value: "02" } });
    expect(quantity.value).toBe("2");
  });

  it("switches between percentage and fixed tax inputs", () => {
    render(
      <SplitBillEditor
        action={action}
        finalizeAction={finalizeAction}
        initial={{
          ...emptyInitial,
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

    expect(screen.getByLabelText("Tax (%)")).toBeInTheDocument();
    expect(screen.queryByLabelText("Tax (Rp)")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Tax type"), {
      target: { value: "fixed" },
    });

    expect(screen.queryByLabelText("Tax (%)")).not.toBeInTheDocument();
    const fixed = screen.getByLabelText("Tax (Rp)") as HTMLInputElement;
    fireEvent.change(fixed, { target: { value: "Rp5.000" } });
    expect(fixed.value).toBe("5.000");
  });
});
