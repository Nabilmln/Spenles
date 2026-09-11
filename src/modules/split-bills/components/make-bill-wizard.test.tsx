import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { FriendRow } from "@/modules/friends";
import { MakeBillWizard } from "./make-bill-wizard";

const { saveSplitBillDraftAction, finalizeSplitBillAction } = vi.hoisted(() => ({
  saveSplitBillDraftAction: vi.fn(async () => ({
    success: "Split Bill saved as draft.",
    id: "00000000-0000-4000-8000-000000000001",
    revision: 0,
  })),
  finalizeSplitBillAction: vi.fn(async () => ({
    success: "Split Bill finalized.",
    finalizedId: "00000000-0000-4000-8000-000000000001",
  })),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("../actions/make-bill-actions", () => ({
  saveSplitBillDraftAction,
  finalizeSplitBillAction,
}));

vi.mock("./make-bill-preview-sheet", () => ({
  MakeBillPreviewSheet: () => null,
}));

afterEach(() => {
  cleanup();
  saveSplitBillDraftAction.mockClear();
  finalizeSplitBillAction.mockClear();
});

const friends: FriendRow[] = [
  { id: "f1", name: "Nabil", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "f2", name: "Ayu", createdAt: "2026-01-01T00:00:00.000Z" },
];

describe("MakeBillWizard", () => {
  it("starts on the friends step with Continue disabled", () => {
    render(<MakeBillWizard friends={friends} />);

    expect(screen.getByText("Friends", { selector: "h2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
  });

  it("adds friends through the picker sheet and enables Continue", async () => {
    render(<MakeBillWizard friends={friends} />);

    fireEvent.click(screen.getByRole("button", { name: "Add Friend" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.click(await waitFor(() => screen.getByRole("button", { name: "Nabil" })));
    fireEvent.click(screen.getByRole("button", { name: "Add 1 Friend" }));

    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
    expect(dialog).toBeInTheDocument();
  });

  it("reveals bill details after continuing past friends", async () => {
    render(<MakeBillWizard friends={friends} />);

    fireEvent.click(screen.getByRole("button", { name: "Add Friend" }));
    fireEvent.click(await screen.findByRole("button", { name: "Nabil" }));
    fireEvent.click(screen.getByRole("button", { name: "Add 1 Friend" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByLabelText("Merchant")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bill date" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Item" })).toBeInTheDocument();
  });

  it("creates item cards with quantity, unit price, and total price inputs", async () => {
    render(<MakeBillWizard friends={friends} />);

    fireEvent.click(screen.getByRole("button", { name: "Add Friend" }));
    fireEvent.click(await screen.findByRole("button", { name: "Nabil" }));
    fireEvent.click(screen.getByRole("button", { name: "Add 1 Friend" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    fireEvent.click(screen.getByRole("button", { name: "Add Item" }));

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Item name")).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity")).toBeInTheDocument();
    expect(screen.getByLabelText("Unit price")).toBeInTheDocument();
    expect(screen.getByLabelText("Total price")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete item 1" }),
    ).toHaveAccessibleName("Delete item 1");
  });

  it("shows tax, description, and confirm actions on the overview step", async () => {
    render(<MakeBillWizard friends={friends} />);

    fireEvent.click(screen.getByRole("button", { name: "Add Friend" }));
    fireEvent.click(await screen.findByRole("button", { name: "Nabil" }));
    fireEvent.click(screen.getByRole("button", { name: "Add 1 Friend" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    fireEvent.change(screen.getByLabelText("Merchant"), {
      target: { value: "Warung Nasi Padang" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Item" }));
    fireEvent.change(screen.getByLabelText("Item name"), {
      target: { value: "Nasi Padang" },
    });
    const unitPrice = screen.getByLabelText("Unit price") as HTMLInputElement;
    fireEvent.change(unitPrice, { target: { value: "Rp30.000" } });

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(
      screen.getByRole("button", { name: "Add Tax (Optional)" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Description (optional)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Draft" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("saves a draft using the server action", async () => {
    render(<MakeBillWizard friends={friends} />);

    fireEvent.click(screen.getByRole("button", { name: "Add Friend" }));
    fireEvent.click(await screen.findByRole("button", { name: "Nabil" }));
    fireEvent.click(screen.getByRole("button", { name: "Add 1 Friend" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    fireEvent.change(screen.getByLabelText("Merchant"), {
      target: { value: "Warung Nasi Padang" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Item" }));
    fireEvent.change(screen.getByLabelText("Item name"), {
      target: { value: "Nasi Padang" },
    });
    fireEvent.change(screen.getByLabelText("Unit price"), {
      target: { value: "Rp30.000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    fireEvent.click(screen.getByRole("button", { name: "Save Draft" }));

    await waitFor(() => expect(saveSplitBillDraftAction).toHaveBeenCalledTimes(1));
  });
});