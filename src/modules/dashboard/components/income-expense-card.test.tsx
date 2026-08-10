import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { IncomeExpenseCard } from "./income-expense-card";

afterEach(cleanup);

describe("IncomeExpenseCard", () => {
  it("labels the chart, summary, and exact monthly values", () => {
    render(
      <IncomeExpenseCard
        points={[
          {
            period: "2026-08",
            label: "Agustus 2026",
            incomeIdr: "5000000",
            expenseIdr: "2000000",
            incomePlot: 1,
            expensePlot: 0.4,
          },
        ]}
        totalIncome={5000000n}
        totalExpense={2000000n}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Pemasukan vs Pengeluaran" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Total pemasukan/)).toBeInTheDocument();
    const amounts = screen.getAllByText(/Rp\s*5\.000\.000|Rp\s*2\.000\.000/u);
    expect(amounts).toHaveLength(3);
    expect(
      screen.getByRole("table", { name: "Pemasukan dan pengeluaran per bulan" }),
    ).toHaveTextContent("Agustus 2026");
    expect(
      screen.getByRole("table", { name: "Pemasukan dan pengeluaran per bulan" }),
    ).toHaveTextContent(/Rp\s*5\.000\.000/u);
  });
});