import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("react-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-dom")>();
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

vi.mock("../actions/account-actions", () => ({
  updateAccountFromSheetAction: vi.fn(),
  deleteAccountAction: vi.fn(),
  createAccountFromSheetAction: vi.fn(),
}));

import { AccountDetailSheet } from "./account-detail-sheet";

const row = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "BCA Savings",
  type: "savings" as const,
  status: "active" as const,
  systemKey: null,
  openingBalance: "500000",
  balance: "12500000",
};

afterEach(cleanup);

describe("AccountDetailSheet", () => {
  it("does not render when no account is selected", () => {
    render(<AccountDetailSheet row={null} onClose={vi.fn()} />);
    expect(screen.queryByText("Account Details")).not.toBeInTheDocument();
  });

  it("renders the edit form with name, type and status toggle", () => {
    render(<AccountDetailSheet row={row} onClose={vi.fn()} />);
    expect(screen.getByText("Account Details")).toBeInTheDocument();
    expect(screen.getByDisplayValue("BCA Savings")).toBeInTheDocument();
    expect(screen.getByText("Savings")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Active account" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("button", { name: "Save Edit" })).toBeInTheDocument();
  });

  it("opens the account type curtain and selects a type", async () => {
    render(<AccountDetailSheet row={row} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText("Savings"));

    expect(
      screen.getByRole("dialog", { name: "Choose account type" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Cash")).toBeInTheDocument();
    expect(screen.getByText("E-wallet")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cash"));

    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Choose account type" })).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Cash")).toBeInTheDocument();
  });

  it("shows a delete confirmation before deleting", () => {
    render(<AccountDetailSheet row={row} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));

    expect(
      screen.getByRole("alertdialog", { name: "Delete account?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete "BCA Savings"/),
    ).toBeInTheDocument();
  });

  it("closes the confirmation dialog without deleting on cancel", async () => {
    render(<AccountDetailSheet row={row} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });
});

import { AccountList } from "./account-list";

describe("AccountList", () => {
  it("renders account cards with status badge and detail button", () => {
    render(
      <AccountList
        rows={[
          row,
          { ...row, id: "22222222-2222-4222-8222-222222222222", name: "Old", status: "archived" },
        ]}
      />,
    );

    expect(screen.getByText("BCA Savings")).toBeInTheDocument();
    expect(screen.getByText("Old")).toBeInTheDocument();
    expect(screen.getAllByText("Savings")).toHaveLength(2);
    expect(screen.getAllByText("Balance")).toHaveLength(2);
    expect(screen.getAllByText("Rp 12.500.000")).toHaveLength(2);
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
    expect(screen.getAllByText("Detail")).toHaveLength(2);
  });

  it("opens the detail sheet when detail is pressed", () => {
    render(<AccountList rows={[row]} />);
    fireEvent.click(screen.getByRole("button", { name: "Open details for BCA Savings" }));

    expect(screen.getByText("Account Details")).toBeInTheDocument();
    expect(screen.getByDisplayValue("BCA Savings")).toBeInTheDocument();
  });
});