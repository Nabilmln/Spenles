import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CashFlowOverviewCard } from "./cash-flow-overview-card";

afterEach(cleanup);

describe("CashFlowOverviewCard", () => {
  it("labels the line chart, summary, and exact monthly values", () => {
    render(
      <CashFlowOverviewCard
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
      screen.getByRole("heading", { name: "Arus Kas" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Total pemasukan/)).toBeInTheDocument();
    const table = screen.getByRole("table", { name: "Arus kas per bulan" });
    expect(table).toHaveTextContent("Agustus 2026");
    expect(table).toHaveTextContent(/Rp\s*5\.000\.000/u);
  });

  it("shows a zero-data hint when the range has no transactions", () => {
    render(
      <CashFlowOverviewCard
        points={[
          {
            period: "2026-08",
            label: "Agustus 2026",
            incomeIdr: "0",
            expenseIdr: "0",
            incomePlot: 0,
            expensePlot: 0,
          },
        ]}
        totalIncome={0n}
        totalExpense={0n}
      />,
    );

    expect(
      screen.getByText("Belum ada transaksi pada periode ini."),
    ).toBeInTheDocument();
  });
});