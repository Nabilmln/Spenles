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
      screen.getByRole("region", { name: "Arus Kas" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Harian" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mingguan" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bulanan" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bulanan" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByText(/Total pemasukan Rp\s*20\.000\.000/u),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Lihat data tabel/u)).not.toBeInTheDocument();
  });

  it("switches to the last seven days when Harian is selected", () => {
    render(
      <CashFlowOverviewCard
        daily={daily}
        monthly={monthly}
        weekly={weekly}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Harian" }));

    expect(screen.getByRole("button", { name: "Harian" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByText(/Total pemasukan Rp\s*500\.000/u),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/7 hari terakhir/u),
    ).toBeInTheDocument();
  });

  it("switches to the last four weeks when Mingguan is selected", () => {
    render(
      <CashFlowOverviewCard
        daily={daily}
        monthly={monthly}
        weekly={weekly}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Mingguan" }));

    expect(
      screen.getByText(/Total pemasukan Rp\s*3\.000\.000/u),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/4 minggu terakhir/u),
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

    fireEvent.click(screen.getByRole("button", { name: "Harian" }));

    expect(
      screen.getByText("Belum ada transaksi pada periode ini."),
    ).toBeInTheDocument();
  });
});