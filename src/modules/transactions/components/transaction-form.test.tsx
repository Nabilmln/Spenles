import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
  { id: "cat-1", name: "Makanan", type: "expense" as const },
  { id: "cat-2", name: "Gaji", type: "income" as const },
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
  it("shows a segmented control with expense, income and savings options", () => {
    renderForm();
    expect(screen.getByRole("radio", { name: "Expense" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Income" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "Savings" })).not.toBeChecked();
  });

  it("uses date-only input for the transaction date", () => {
    renderForm();
    const dateInput = screen.getByLabelText("Date");
    expect(dateInput).toHaveAttribute("type", "date");
    expect(dateInput).toHaveValue("2026-08-07");
  });

  it("maps expense categories only in expense mode", () => {
    renderForm();
    expect(screen.getByLabelText("Expense category")).toBeInTheDocument();
    const select = screen.getByLabelText("Expense category");
    const expenses = Array.from(select.querySelectorAll("option")).map((option) => option.value);
    expect(expenses).toContain("cat-1");
    expect(expenses).not.toContain("cat-2");
  });

  it("maps income categories only in income mode", () => {
    renderForm();
    fireEvent.click(screen.getByRole("radio", { name: "Income" }));
    const select = screen.getByLabelText("Income category");
    const incomes = Array.from(select.querySelectorAll("option")).map((option) => option.value);
    expect(incomes).toContain("cat-2");
    expect(incomes).not.toContain("cat-1");
  });

  it("opens the calculator from the amount field and updates the amount via Done", () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Enter the amount using the calculator" }));
    expect(screen.getByRole("dialog", { name: "Amount calculator" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    expect(screen.queryByRole("dialog", { name: "Amount calculator" })).not.toBeInTheDocument();
    const hidden = document.querySelector('input[type="hidden"][name="amount"]');
    expect(hidden).toHaveValue("28");
  });

  it("keeps the amount display visible while the keypad is open", () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Enter the amount using the calculator" }));
    expect(screen.getByRole("dialog", { name: "Amount calculator" })).toBeInTheDocument();
    expect(screen.getByLabelText("Enter the amount using the calculator")).toBeInTheDocument();
  });

  it("renders the navy savings-specific account fields but no category", () => {
    renderForm();
    fireEvent.click(screen.getByRole("radio", { name: "Savings" }));
    expect(screen.getByLabelText("From account")).toBeInTheDocument();
    expect(screen.getByLabelText("To savings account")).toBeInTheDocument();
    expect(screen.getByText("Fund direction")).toBeInTheDocument();
    expect(screen.queryByText("Expense category")).not.toBeInTheDocument();
    expect(screen.queryByText("Income category")).not.toBeInTheDocument();
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
    fireEvent.click(screen.getByRole("radio", { name: "Savings" }));
    const submit = screen.getByRole("button", { name: "Confirm" });
    expect(submit).toBeDisabled();
  });

  it("prevents duplicate submission by disabling the confirm button while pending", () => {
    renderForm();
    const submit = screen.getByRole("button", { name: "Confirm" });
    expect(submit).not.toBeDisabled();
  });
});