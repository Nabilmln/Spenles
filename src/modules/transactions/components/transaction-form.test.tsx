import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TransactionForm } from "./transaction-form";

vi.mock("@/modules/accounts/actions/transfer-actions", () => ({
  createTransferAction: vi.fn(async () => ({ error: "Transaksi belum dapat disimpan." })),
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
      action={async () => ({ error: "Gagal" })}
      accounts={accounts}
      categories={categories}
      defaultDate="2026-08-07"
    />,
  );
}

describe("TransactionForm", () => {
  it("shows a segmented control with expense, income and savings options", () => {
    renderForm();
    expect(screen.getByRole("radio", { name: "Pengeluaran" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Pendapatan" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "Tabungan" })).not.toBeChecked();
  });

  it("uses date-only input for the transaction date", () => {
    renderForm();
    const dateInput = screen.getByLabelText("Tanggal");
    expect(dateInput).toHaveAttribute("type", "date");
    expect(dateInput).toHaveValue("2026-08-07");
  });

  it("maps expense categories only in expense mode", () => {
    renderForm();
    expect(screen.getByLabelText("Kategori pengeluaran")).toBeInTheDocument();
    const select = screen.getByLabelText("Kategori pengeluaran");
    const expenses = Array.from(select.querySelectorAll("option")).map((option) => option.value);
    expect(expenses).toContain("cat-1");
    expect(expenses).not.toContain("cat-2");
  });

  it("maps income categories only in income mode", () => {
    renderForm();
    fireEvent.click(screen.getByRole("radio", { name: "Pendapatan" }));
    const select = screen.getByLabelText("Kategori pendapatan");
    const incomes = Array.from(select.querySelectorAll("option")).map((option) => option.value);
    expect(incomes).toContain("cat-2");
    expect(incomes).not.toContain("cat-1");
  });

  it("opens the calculator from the amount field and updates the amount via Selesai", () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Isi jumlah nominal menggunakan kalkulator" }));
    expect(screen.getByRole("dialog", { name: "Kalkulator jumlah" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "Tambah" }));
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "Selesai" }));

    expect(screen.queryByRole("dialog", { name: "Kalkulator jumlah" })).not.toBeInTheDocument();
    const hidden = document.querySelector('input[type="hidden"][name="amount"]');
    expect(hidden).toHaveValue("28");
  });

  it("keeps the amount display visible while the keypad is open", () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Isi jumlah nominal menggunakan kalkulator" }));
    expect(screen.getByRole("dialog", { name: "Kalkulator jumlah" })).toBeInTheDocument();
    expect(screen.getByLabelText("Isi jumlah nominal menggunakan kalkulator")).toBeInTheDocument();
  });

  it("renders the navy savings-specific account fields but no category", () => {
    renderForm();
    fireEvent.click(screen.getByRole("radio", { name: "Tabungan" }));
    expect(screen.getByLabelText("Dari akun")).toBeInTheDocument();
    expect(screen.getByLabelText("Ke akun tabungan")).toBeInTheDocument();
    expect(screen.getByText("Arah dana")).toBeInTheDocument();
    expect(screen.queryByText("Kategori pengeluaran")).not.toBeInTheDocument();
    expect(screen.queryByText("Kategori pendapatan")).not.toBeInTheDocument();
  });

  it("blocks savings submission when no savings account exists", () => {
    render(
      <TransactionForm
        action={async () => ({ error: "Gagal" })}
        accounts={[{ id: "acc-1", name: "Kas Utama", type: "cash" }]}
        categories={categories}
        defaultDate="2026-08-07"
      />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Tabungan" }));
    const submit = screen.getByRole("button", { name: "Konfirmasi" });
    expect(submit).toBeDisabled();
  });

  it("prevents duplicate submission by disabling the confirm button while pending", () => {
    renderForm();
    const submit = screen.getByRole("button", { name: "Konfirmasi" });
    expect(submit).not.toBeDisabled();
  });
});