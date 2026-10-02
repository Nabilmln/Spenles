import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import { createTransactionAction } from "../actions/transaction-actions";
import { AddTransactionSheet } from "./add-transaction-sheet";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh, push: vi.fn() }),
}));

vi.mock("@/modules/accounts/actions/transfer-actions", () => ({
  createTransferAction: vi.fn(),
}));

vi.mock("../actions/transaction-actions", () => ({
  createTransactionAction: vi.fn(async () => ({ success: "Expense recorded.", redirectTo: "/transactions" })),
  getTransactionOptionsAction: vi.fn(async () => ({
    accounts: [{ id: "account-1", name: "Cash", type: "cash" }],
    categories: [{ id: "category-1", name: "Food", type: "expense", icon: null, color: null }],
  })),
}));

afterEach(() => {
  cleanup();
  refresh.mockClear();
  vi.mocked(createTransactionAction).mockReset();
});

describe("AddTransactionSheet", () => {
  it("closes and refreshes the current page after a successful save", async () => {
    vi.mocked(createTransactionAction).mockResolvedValue({
      success: "Expense recorded.",
      redirectTo: "/transactions",
    });
    const onClose = vi.fn();
    render(<ToastProvider><AddTransactionSheet open onClose={onClose} /></ToastProvider>);

    const submit = await screen.findByRole("button", { name: "Add Transaction" });
    fireEvent.submit(submit.closest("form") as HTMLFormElement);

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Expense recorded.");
  });

  it("keeps the sheet open when saving fails", async () => {
    vi.mocked(createTransactionAction).mockResolvedValue({ error: "Transaction could not be saved." });
    const onClose = vi.fn();
    render(<ToastProvider><AddTransactionSheet open onClose={onClose} /></ToastProvider>);

    const submit = await screen.findByRole("button", { name: "Add Transaction" });
    fireEvent.submit(submit.closest("form") as HTMLFormElement);

    expect(await screen.findByRole("alert")).toHaveTextContent("Transaction could not be saved.");
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Add transaction" })).toBeInTheDocument();
  });
});
