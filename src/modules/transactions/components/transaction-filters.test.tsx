import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { TransactionFilters } from "../schemas/transaction-filters";
import { activeFilterCount, TransactionFilterBar } from "./transaction-filters";

afterEach(cleanup);

const baseFilters: TransactionFilters = {
  q: "",
  type: undefined,
  category: undefined,
  account: undefined,
  month: undefined,
  from: undefined,
  to: undefined,
  sort: "transactionAt",
  direction: "desc",
  page: 1,
  pageSize: 20,
};

const accounts = [{ id: "acc-1", name: "Kas Utama" }];
const categories = [
  { id: "cat-1", name: "Makanan", type: "expense" as const },
  { id: "cat-2", name: "Gaji", type: "income" as const },
];

function hiddenValue(container: HTMLElement, name: string) {
  return (
    container.querySelector<HTMLInputElement>(`input[type="hidden"][name="${name}"]`)
      ?.value ?? ""
  );
}

describe("TransactionFilterBar", () => {
  it("renders a search field and hides the filter sheet by default", () => {
    const { container } = render(
      <TransactionFilterBar
        accounts={accounts}
        categories={categories}
        filters={baseFilters}
      />,
    );

    expect(
      screen.getByRole("searchbox", { name: "Cari deskripsi atau kategori" }),
    ).toHaveAttribute("placeholder", "Cari deskripsi atau kategori");
    expect(screen.getByRole("button", { name: "Buka filter" })).toBeInTheDocument();
    expect(
      screen.queryByRole("dialog", { name: "Filter transaksi" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Tambah transaksi")).not.toBeInTheDocument();
    expect(container.querySelector('form')).toHaveAttribute("method", "get");
  });

  it("shows an active filter count badge and preserves applied filters in hidden inputs", () => {
    render(
      <TransactionFilterBar
        accounts={accounts}
        categories={categories}
        filters={{ ...baseFilters, type: "expense", sort: "amount" }}
      />,
    );

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("opens the filter sheet and exposes all filter controls and actions", () => {
    render(
      <TransactionFilterBar
        accounts={accounts}
        categories={categories}
        filters={baseFilters}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Buka filter" }));

    expect(screen.getByRole("dialog", { name: "Filter transaksi" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Jenis transaksi" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Kategori" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Akun" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Urutkan" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Arah urutan" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Terapkan Filter" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reset" })).toHaveAttribute(
      "href",
      "/transactions",
    );
    expect(screen.getByRole("button", { name: "Tutup filter" })).toBeInTheDocument();
    expect(screen.queryByText("Tambah transaksi")).not.toBeInTheDocument();
  });

  it("closes the sheet from the close button and the Escape key", () => {
    render(
      <TransactionFilterBar
        accounts={accounts}
        categories={categories}
        filters={baseFilters}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Buka filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Tutup filter" }));
    expect(
      screen.queryByRole("dialog", { name: "Filter transaksi" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Buka filter" }));
    fireEvent.keyDown(screen.getByRole("dialog", { name: "Filter transaksi" }), {
      key: "Escape",
    });
    expect(
      screen.queryByRole("dialog", { name: "Filter transaksi" }),
    ).not.toBeInTheDocument();
  });

  it("applies a filter selection to the submitted form without a page parameter", () => {
    const { container } = render(
      <TransactionFilterBar
        accounts={accounts}
        categories={categories}
        filters={baseFilters}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Buka filter" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Jenis transaksi" }), {
      target: { value: "expense" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Kategori" }), {
      target: { value: "cat-1" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Urutkan" }), {
      target: { value: "amount" },
    });

    expect(hiddenValue(container, "type")).toBe("expense");
    expect(hiddenValue(container, "category")).toBe("cat-1");
    expect(hiddenValue(container, "sort")).toBe("amount");
    expect(hiddenValue(container, "direction")).toBe("desc");
    expect(
      container.querySelector('input[type="hidden"][name="page"]'),
    ).toBeNull();
    expect(container.querySelector('input[type="hidden"][name="pageSize"]')).not.toBeNull();
  });
});

describe("activeFilterCount", () => {
  it("counts only non-default filter selections", () => {
    expect(activeFilterCount(baseFilters)).toBe(0);
    expect(activeFilterCount({ ...baseFilters, q: "kopi" })).toBe(1);
    expect(
      activeFilterCount({ ...baseFilters, type: "income", direction: "asc" }),
    ).toBe(2);
    expect(
      activeFilterCount({
        ...baseFilters,
        category: "cat-1",
        month: "2026-08",
        sort: "amount",
      }),
    ).toBe(3);
  });
});
