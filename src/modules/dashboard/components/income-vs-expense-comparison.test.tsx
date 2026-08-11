import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { IncomeVsExpenseComparison } from "./income-vs-expense-comparison";

afterEach(cleanup);

describe("IncomeVsExpenseComparison", () => {
  it("renders both monthly totals and the comparison heading", () => {
    render(
      <IncomeVsExpenseComparison
        income={5000000n}
        expense={2000000n}
        incomeChangeBps={null}
        expenseChangeBps={null}
        previousLabel="September 2026"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Pemasukan vs Pengeluaran" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Pemasukan bulan ini"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Rp\s*5\.000\.000/u),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Rp\s*2\.000\.000/u),
    ).toBeInTheDocument();
    expect(screen.queryByText(/dibanding/)).not.toBeInTheDocument();
  });

  it("shows directional change text when a baseline exists", () => {
    render(
      <IncomeVsExpenseComparison
        income={1500000n}
        expense={2000000n}
        incomeChangeBps="840"
        expenseChangeBps="-1234"
        previousLabel="September 2026"
      />,
    );

    expect(
      screen.getByText(/▲ 8,40% dibanding September 2026/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/▼ 12,34% dibanding September 2026/),
    ).toBeInTheDocument();
  });

  it("omits change text when the change is zero or unavailable", () => {
    render(
      <IncomeVsExpenseComparison
        income={2000000n}
        expense={2000000n}
        incomeChangeBps="0"
        expenseChangeBps={null}
        previousLabel="September 2026"
      />,
    );

    expect(
      screen.getByText(/Sama dengan September 2026/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/dibanding/)).not.toBeInTheDocument();
  });
});