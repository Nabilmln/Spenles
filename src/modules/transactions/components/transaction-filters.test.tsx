import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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
  pageSize: 15,
};

const accounts = [{ id: "acc-1", name: "Kas Utama" }];
const categories = [
  { id: "cat-1", name: "Makanan", type: "expense" as const, icon: null, color: null },
  { id: "cat-2", name: "Gaji", type: "income" as const, icon: null, color: null },
];

function hiddenValues(container: HTMLElement, name: string) {
  return Array.from(
    container.querySelectorAll<HTMLInputElement>(`input[type="hidden"][name="${name}"]`),
  ).map((input) => input.value);
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
      screen.getByRole("searchbox", { name: "Search description or category" }),
    ).toHaveAttribute("placeholder", "Search transactions...");
    expect(screen.getByRole("button", { name: "Open filters" })).toBeInTheDocument();
    expect(
      screen.queryByRole("dialog", { name: "Filter transactions" }),
    ).not.toBeInTheDocument();
    expect(container.querySelector('form')).toHaveAttribute("method", "get");
  });

  it("shows an active filter count badge for applied filters", () => {
    render(
      <TransactionFilterBar
        accounts={accounts}
        categories={categories}
        filters={{ ...baseFilters, type: "expense" }}
      />,
    );

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("opens the filter sheet with segmented type, category, account, and date controls", () => {
    render(
      <TransactionFilterBar
        accounts={accounts}
        categories={categories}
        filters={baseFilters}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open filters" }));

    expect(screen.getByRole("dialog", { name: "Filter transactions" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Transaction type" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Payment" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Income" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Choose Category" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All Accounts" })).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Sort" })).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Sort direction" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply Filters" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reset" })).toHaveAttribute(
      "href",
      "/transactions",
    );
  });

  it("closes the sheet from the close button and the Escape key", async () => {
    render(
      <TransactionFilterBar
        accounts={accounts}
        categories={categories}
        filters={baseFilters}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open filters" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Filter transactions" }),
      ).not.toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Open filters" }));
    fireEvent.keyDown(screen.getByRole("dialog", { name: "Filter transactions" }), {
      key: "Escape",
    });
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Filter transactions" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("selects a transaction type via the segmented control", () => {
    const { container } = render(
      <TransactionFilterBar
        accounts={accounts}
        categories={categories}
        filters={baseFilters}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open filters" }));
    fireEvent.click(screen.getByRole("button", { name: "Payment" }));

    expect(hiddenValues(container, "type")).toEqual(["expense"]);
  });

  it("selects multiple categories from the category curtain", async () => {
    const { container } = render(
      <TransactionFilterBar
        accounts={accounts}
        categories={categories}
        filters={baseFilters}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open filters" }));
    fireEvent.click(screen.getByRole("button", { name: "Choose Category" }));

    const categoryDialog = screen.getByRole("dialog", { name: "Choose category" });
    fireEvent.click(screen.getByRole("button", { name: /Makanan/ }));
    fireEvent.click(screen.getByRole("button", { name: /Gaji/ }));
    expect(categoryDialog).toBeInTheDocument();

    fireEvent.click(
      within(categoryDialog).getByRole("button", { name: "Close" }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Choose category" }),
      ).not.toBeInTheDocument(),
    );
    expect(hiddenValues(container, "category")).toEqual(["cat-1", "cat-2"]);
  });

  it("selects an account from the account curtain", async () => {
    const { container } = render(
      <TransactionFilterBar
        accounts={accounts}
        categories={categories}
        filters={baseFilters}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open filters" }));
    fireEvent.click(screen.getByRole("button", { name: "All Accounts" }));

    expect(screen.getByRole("dialog", { name: "Select account" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Kas Utama/ }));

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Select account" }),
      ).not.toBeInTheDocument(),
    );
    expect(hiddenValues(container, "account")).toEqual(["acc-1"]);
  });
});

describe("activeFilterCount", () => {
  it("counts only non-default filter selections", () => {
    expect(activeFilterCount(baseFilters)).toBe(0);
    expect(activeFilterCount({ ...baseFilters, q: "kopi" })).toBe(1);
    expect(activeFilterCount({ ...baseFilters, type: "income" })).toBe(1);
    expect(
      activeFilterCount({
        ...baseFilters,
        category: ["cat-1", "cat-2"],
        month: "2026-08",
      }),
    ).toBe(3);
  });
});