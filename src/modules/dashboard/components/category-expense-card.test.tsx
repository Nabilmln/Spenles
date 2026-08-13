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
  it("renders the pie chart card with a summary and no data table", () => {
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
    expect(screen.getByText("Agustus 2026")).toBeInTheDocument();
    expect(
      screen.getByText(/Total pengeluaran Rp\s*2\.000\.000/u),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByText(/Lihat data tabel/u)).not.toBeInTheDocument();
  });

  it("keeps every category in the sr-only exact list beyond the visual top five", () => {
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

    expect(screen.getByText(/A: Rp\s*1\.000\.000/u)).toBeInTheDocument();
    expect(screen.getByText(/F: Rp\s*1\.000\.000/u)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows a zero-data status when there is no expense", () => {
    render(
      <CategoryExpenseCard
        periodLabel="Agustus 2026"
        points={[]}
        totalExpense={0n}
      />,
    );

    expect(
      screen.getByText("Belum ada pengeluaran pada periode ini."),
    ).toBeInTheDocument();
  });
});