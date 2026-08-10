import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CategoryExpenseCard } from "./category-expense-card";

afterEach(cleanup);

function point(
  categoryId: string,
  name: string,
  expenseIdr: string,
  shareBps: number,
) {
  return {
    categoryId,
    name,
    color: "#2563eb",
    icon: null,
    expenseIdr,
    shareBps,
    rank: 1,
  };
}

describe("CategoryExpenseCard", () => {
  it("shows the chart, summary, and an exact table for every category", () => {
    render(
      <CategoryExpenseCard
        periodLabel="Agustus 2026"
        points={[
          point("cat-1", "Makanan", "1200000", 6000),
          point("cat-2", "Transportasi", "800000", 4000),
        ]}
        totalExpense={2000000n}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Pengeluaran per Kategori" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Total pengeluaran Rp\s*2\.000\.000/u)).toBeInTheDocument();
    const table = screen.getByRole("table", { name: "Pengeluaran per kategori" });
    expect(table).toHaveTextContent("Makanan");
    expect(table).toHaveTextContent("Transportasi");
    expect(table).toHaveTextContent(/1\.200\.000/u);
    expect(table).toHaveTextContent(/800\.000/u);
    expect(table).toHaveTextContent("60%");
    expect(table).toHaveTextContent("40%");
  });

  it("keeps every category in the exact table beyond the visual top five", () => {
    render(
      <CategoryExpenseCard
        periodLabel="Agustus 2026"
        points={[
          point("c1", "A", "1000000", 2000),
          point("c2", "B", "1000000", 2000),
          point("c3", "C", "1000000", 2000),
          point("c4", "D", "1000000", 2000),
          point("c5", "E", "1000000", 2000),
          point("c6", "F", "1000000", 2000),
        ]}
        totalExpense={6000000n}
      />,
    );

    const table = screen.getByRole("table", { name: "Pengeluaran per kategori" });
    expect(table).toHaveTextContent("A");
    expect(table).toHaveTextContent("F");
    expect(table).not.toHaveTextContent("Kategori lainnya");
  });
});