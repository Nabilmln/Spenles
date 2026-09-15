import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { FriendRow } from "@/modules/friends";
import { MakeBillWizard } from "./make-bill-wizard";

const {
  saveSplitBillDraftAction,
  finalizeSplitBillAction,
  getSplitBillResultAction,
} = vi.hoisted(() => {
  const result = {
    id: "00000000-0000-4000-8000-000000000001",
    merchantName: "Warung Nasi Padang",
    billDate: "2026-01-15",
    note: null,
    status: "finalized",
    subtotalAmount: "30000",
    discountAmount: "0",
    itemTaxAmount: "0",
    billTaxAmount: "0",
    serviceChargeAmount: "0",
    finalAmount: "30000",
    participants: [
      {
        id: "f1",
        name: "Nabil",
        itemAmount: "30000",
        itemTaxAmount: "0",
        billTaxAmount: "0",
        serviceChargeAmount: "0",
        finalAmount: "30000",
      },
    ],
    items: [
      {
        id: "item1",
        name: "Nasi Padang",
        quantity: 1,
        unitPrice: "30000",
        participantIds: ["f1"],
      },
    ],
  };
  return {
    saveSplitBillDraftAction: vi.fn(async () => ({
      success: "Draft updated.",
      id: "00000000-0000-4000-8000-000000000001",
      revision: 1,
    })),
    finalizeSplitBillAction: vi.fn(async () => ({
      success: "Split Bill finalized.",
      finalizedId: "00000000-0000-4000-8000-000000000001",
    })),
    getSplitBillResultAction: vi.fn(async () => ({ ok: true, result })),
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("../actions/make-bill-actions", () => ({
  saveSplitBillDraftAction,
  finalizeSplitBillAction,
}));

vi.mock("../actions/split-bill-actions", () => ({
  getSplitBillResultAction,
}));

vi.mock("./split-bill-result-sheet", () => ({
  SplitBillResultSheet: () => null,
}));

afterEach(() => {
  cleanup();
  saveSplitBillDraftAction.mockClear();
  finalizeSplitBillAction.mockClear();
  getSplitBillResultAction.mockClear();
});

const friends: FriendRow[] = [
  { id: "f1", name: "Nabil", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "f2", name: "Ayu", createdAt: "2026-01-01T00:00:00.000Z" },
];

async function selectFriend(name: string) {
  const openButton = screen.queryByRole("button", { name: "Add" })
    ? screen.getByRole("button", { name: "Add" })
    : screen.getByRole("button", { name: "Add Friend" });
  fireEvent.click(openButton);
  fireEvent.click(await screen.findByRole("button", { name }));
  fireEvent.click(screen.getByRole("button", { name: "Add 1 Friend" }));
}

async function fillValidItem() {
  fireEvent.click(screen.getByRole("button", { name: "Add Item" }));
  fireEvent.change(screen.getByLabelText("Item name"), {
    target: { value: "Nasi Padang" },
  });
  fireEvent.change(screen.getByLabelText("Unit price"), {
    target: { value: "Rp30.000" },
  });
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Nabil pays for item 1" }),
  );
}

describe("MakeBillWizard", () => {
  it("renders the timeline and friends section as separate containers", () => {
    render(<MakeBillWizard friends={friends} />);

    expect(
      screen.getByLabelText("Bill progress timeline"),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Friends" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Friend" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Continue" })).not.toBeInTheDocument();
  });

  it("reveals bill details below the friends section after selecting a friend", async () => {
    render(<MakeBillWizard friends={friends} />);

    await selectFriend("Nabil");

    expect(screen.getByRole("heading", { name: "Friends" })).toBeInTheDocument();
    expect(screen.getByLabelText("Merchant name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Date" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Item" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
  });

  it("shows per-item participant rows sourced from the selected friends", async () => {
    render(<MakeBillWizard friends={friends} />);

    await selectFriend("Nabil");
    await selectFriend("Ayu");
    fireEvent.click(screen.getByRole("button", { name: "Add Item" }));

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Who is paying?")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Nabil pays for item 1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Ayu pays for item 1" }),
    ).toBeInTheDocument();
  });

  it("keeps participant assignment independent per item", async () => {
    render(<MakeBillWizard friends={friends} />);

    await selectFriend("Nabil");
    await selectFriend("Ayu");
    fireEvent.click(screen.getByRole("button", { name: "Add Item" }));
    fireEvent.change(screen.getByLabelText("Item name"), {
      target: { value: "Nasi Goreng" },
    });
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Nabil pays for item 1" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Add item" }));
    fireEvent.change(screen.getAllByLabelText("Item name")[1], {
      target: { value: "Es Teh" },
    });
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Ayu pays for item 2" }),
    );

    expect(
      screen.getByRole("checkbox", { name: "Nabil pays for item 1" }),
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "Ayu pays for item 1" }),
    ).not.toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "Nabil pays for item 2" }),
    ).not.toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "Ayu pays for item 2" }),
    ).toBeChecked();
  });

  it("blocks Continue until every item has a participant", async () => {
    render(<MakeBillWizard friends={friends} />);

    await selectFriend("Nabil");
    fireEvent.change(screen.getByLabelText("Merchant name"), {
      target: { value: "Warung Nasi Padang" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Item" }));
    fireEvent.change(screen.getByLabelText("Item name"), {
      target: { value: "Nasi Padang" },
    });
    fireEvent.change(screen.getByLabelText("Unit price"), {
      target: { value: "Rp30.000" },
    });

    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    expect(
      screen.getAllByRole("alert").some((alert) =>
        alert.textContent?.match(/at least one person/i),
      ),
    ).toBe(true);

    fireEvent.click(
      screen.getByRole("checkbox", { name: "Nabil pays for item 1" }),
    );

    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
  });

  it("opens the overview sheet showing item participant assignments", async () => {
    render(<MakeBillWizard friends={friends} />);

    await selectFriend("Nabil");
    fireEvent.change(screen.getByLabelText("Merchant name"), {
      target: { value: "Warung Nasi Padang" },
    });
    await fillValidItem();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    const dialog = screen.getByRole("dialog", { name: "Overview" });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Draft" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    expect(dialog).toHaveTextContent("Warung Nasi Padang");
    expect(dialog).toHaveTextContent("Nasi Padang");
    expect(dialog).toHaveTextContent("Nabil");
  });

  it("saves a draft from the overview sheet", async () => {
    render(<MakeBillWizard friends={friends} />);

    await selectFriend("Nabil");
    fireEvent.change(screen.getByLabelText("Merchant name"), {
      target: { value: "Warung Nasi Padang" },
    });
    await fillValidItem();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    fireEvent.click(screen.getByRole("button", { name: "Save Draft" }));

    await waitFor(() => expect(saveSplitBillDraftAction).toHaveBeenCalledTimes(1));
  });

  it("returns to bill details from the overview sheet without losing data", async () => {
    render(<MakeBillWizard friends={friends} />);

    await selectFriend("Nabil");
    fireEvent.change(screen.getByLabelText("Merchant name"), {
      target: { value: "Warung Nasi Padang" },
    });
    await fillValidItem();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    const overview = screen.getByRole("dialog", { name: "Overview" });
    fireEvent.click(within(overview).getByRole("button", { name: "Close" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Overview" }),
      ).not.toBeInTheDocument(),
    );
    expect(
      (screen.getByLabelText("Merchant name") as HTMLInputElement).value,
    ).toBe("Warung Nasi Padang");
    expect(
      screen.getByRole("checkbox", { name: "Nabil pays for item 1" }),
    ).toBeChecked();
  });
});