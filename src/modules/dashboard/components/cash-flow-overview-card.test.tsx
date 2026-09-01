import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { IncomeExpensePoint } from "../types/dashboard";
import { CashFlowOverviewCard } from "./cash-flow-overview-card";

afterEach(cleanup);

function point(
  period: string,
  label: string,
  incomeIdr: string,
  expenseIdr: string,
): IncomeExpensePoint {
  const income = BigInt(incomeIdr);
  const expense = BigInt(expenseIdr);
  const maximum = income > expense ? income : expense;
  const plot = (value: bigint) =>
    maximum === 0n ? 0 : Number((value * 10_000n) / maximum) / 10_000;
  return {
    period,
    label,
    incomeIdr,
    expenseIdr,
    incomePlot: plot(income),
    expensePlot: plot(expense),
  };
}

const daily = {
  points: [point("2026-07-30", "Kam 30", "500000", "200000")],
  totalIncome: "500000",
  totalExpense: "200000",
};
const weekly = {
  points: [point("2026-07-27", "27 Jul", "3000000", "1000000")],
  totalIncome: "3000000",
  totalExpense: "1000000",
};
const monthly = {
  points: [point("2026-08", "Agu 26", "20000000", "8000000")],
  totalIncome: "20000000",
  totalExpense: "8000000",
};

describe("CashFlowOverviewCard", () => {
  it("renders the bar-chart card with the three range buttons", () => {
    render(
      <CashFlowOverviewCard
        daily={daily}
        monthly={monthly}
        weekly={weekly}
      />,
    );

    expect(
      screen.getByRole("region", { name: "Cash flow" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Daily" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Weekly" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Monthly" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Monthly" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByText(/Total income Rp\s*20\.000\.000/u),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Lihat data tabel/u)).not.toBeInTheDocument();
  });

  it("switches to the last seven days when Daily is selected", () => {
    render(
      <CashFlowOverviewCard
        daily={daily}
        monthly={monthly}
        weekly={weekly}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Daily" }));

    expect(screen.getByRole("button", { name: "Daily" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByText(/Total income Rp\s*500\.000/u),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/last 7 days/u),
    ).toBeInTheDocument();
  });

  it("switches to the last four weeks when Weekly is selected", () => {
    render(
      <CashFlowOverviewCard
        daily={daily}
        monthly={monthly}
        weekly={weekly}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Weekly" }));

    expect(
      screen.getByText(/Total income Rp\s*3\.000\.000/u),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/last 4 weeks/u),
    ).toBeInTheDocument();
  });

  it("shows a zero-data hint when the active view has no transactions", () => {
    render(
      <CashFlowOverviewCard
        daily={{
          points: [],
          totalIncome: "0",
          totalExpense: "0",
        }}
        monthly={monthly}
        weekly={weekly}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Daily" }));

    expect(
      screen.getByText("No transactions yet for this period."),
    ).toBeInTheDocument();
  });
});