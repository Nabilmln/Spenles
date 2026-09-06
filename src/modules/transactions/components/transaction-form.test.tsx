import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TransactionForm } from "./transaction-form";

vi.mock("@/modules/accounts/actions/transfer-actions", () => ({
  createTransferAction: vi.fn(async () => ({ error: "Transaction could not be saved." })),
}));

afterEach(cleanup);

const accounts = [
  { id: "acc-1", name: "Kas Utama", type: "cash" },
  { id: "acc-2", name: "Tabungan", type: "savings" },
];
const categories = [
  { id: "cat-1", name: "Makanan", type: "expense" as const, icon: null, color: null },
  { id: "cat-2", name: "Gaji", type: "income" as const, icon: null, color: null },
];

function renderForm() {
  return render(
    <TransactionForm
      action={async () => ({ error: "Failed" })}
      accounts={accounts}
      categories={categories}
      defaultDate="2026-08-07"
    />,
  );
}

describe("TransactionForm", () => {
  it("shows a segmented control with payment, income and saving options", () => {
    renderForm();
    expect(screen.getByRole("radio", { name: "Payment" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Income" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "Saving" })).not.toBeChecked();
  });

  it("defaults the date field to today", () => {
    renderForm();
    expect(screen.getByText("7 August 2026")).toBeInTheDocument();
  });

  it("opens the category curtain and selects an expense category", async () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Choose Category" }));
    const dialog = screen.getByRole("dialog", { name: "Select category" });
    fireEvent.click(within(dialog).getByRole("button", { name: /Makanan/ }));

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Select category" }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Makanan")).toBeInTheDocument();
    const hidden = document.querySelector('input[type="hidden"][name="categoryId"]');
    expect(hidden).toHaveValue("cat-1");
  });

  it("opens the account curtain and selects an account", async () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Choose Account" }));
    const dialog = screen.getByRole("dialog", { name: "Select account" });
    fireEvent.click(within(dialog).getByRole("button", { name: /Kas Utama/ }));

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Select account" }),
      ).not.toBeInTheDocument(),
    );
    const hidden = document.querySelector('input[type="hidden"][name="accountId"]');
    expect(hidden).toHaveValue("acc-1");
  });

  it("opens the amount calculator and updates the amount via Use Amount", async () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: /Enter amount/ }));
    expect(screen.getByRole("dialog", { name: "Amount calculator" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "Use Amount" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Amount calculator" }),
      ).not.toBeInTheDocument(),
    );
    const hidden = document.querySelector('input[type="hidden"][name="amount"]');
    expect(hidden).toHaveValue("28");
  });

  it("inserts three zeroes with the 000 button", () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: /Enter amount/ }));
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "Insert three zeros" }));
    expect(screen.getByText(/Rp\s*1\.000/u)).toBeInTheDocument();
  });

  it("renders the savings-specific account fields but no category", () => {
    renderForm();
    fireEvent.click(screen.getByRole("radio", { name: "Saving" }));
    expect(screen.getByText("From account")).toBeInTheDocument();
    expect(screen.getByText("To savings account")).toBeInTheDocument();
    expect(screen.getByText("Fund direction")).toBeInTheDocument();
    expect(screen.queryByText("Category")).not.toBeInTheDocument();
  });

  it("blocks savings submission when no savings account exists", () => {
    render(
      <TransactionForm
        action={async () => ({ error: "Failed" })}
        accounts={[{ id: "acc-1", name: "Kas Utama", type: "cash" }]}
        categories={categories}
        defaultDate="2026-08-07"
      />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Saving" }));
    const submit = screen.getByRole("button", { name: "Add Transaction" });
    expect(submit).toBeDisabled();
  });
});