import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { buildFinancialSnapshot } from "../services/financial-metrics";
import { AccessibleChartTable } from "./accessible-chart-table";
import { CashFlowProfile } from "./cash-flow-profile";
import { ChartShell } from "./chart-shell";
import { RecentTransactions } from "./recent-transactions";

describe("dashboard accessible content", () => {
  it("provides chart summary and exact semantic table values", () => {
    render(
      <ChartShell
        chart={<div aria-hidden="true">visual</div>}
        description="Data per bulan"
        summary="Total Rp1.000"
        table={
          <AccessibleChartTable
            caption="Pengeluaran bulanan"
            columns={[
              { key: "month", label: "Bulan" },
              { key: "amount", label: "Pengeluaran", align: "right" },
            ]}
            rows={[{ id: "2026-08", month: "Agu 26", amount: "Rp1.000" }]}
          />
        }
        title="Pengeluaran bulanan"
      />,
    );

    expect(screen.getByRole("heading", { name: "Pengeluaran bulanan" })).toBeInTheDocument();
    expect(screen.getByText("Total Rp1.000")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Pengeluaran bulanan" })).toHaveTextContent("Rp1.000");
  });

  it("labels averages, denominator, condition, and disclaimer", () => {
    const snapshot = buildFinancialSnapshot(
      { income: 300n, expense: 210n },
      { income: 0n, expense: 0n },
      [
        { period: "2026-06", income: 300n, expense: 210n },
        { period: "2026-07", income: 0n, expense: 0n },
        { period: "2026-08", income: 0n, expense: 0n },
      ],
      [],
      3,
    );
    render(<CashFlowProfile snapshot={snapshot} />);

    expect(screen.getByText("Perlu perhatian")).toBeInTheDocument();
    expect(screen.getByText(/memakai 3 bulan kalender/u)).toBeInTheDocument();
    expect(screen.getByText(/bukan nasihat keuangan profesional/u)).toBeInTheDocument();
  });

  it("renders bounded recent transaction presentation without mutation actions", () => {
    render(
      <RecentTransactions
        rows={[
          {
            id: "owned-1",
            type: "expense",
            amountIdr: "12500",
            transactionAt: new Date("2026-08-05T05:00:00.000Z"),
            note: "Makan siang",
            accountName: "Kas Utama",
            categoryName: "Makanan",
          },
        ]}
      />,
    );

    expect(screen.getByText("Makanan")).toBeInTheDocument();
    expect(screen.getByText("Makan siang")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Lihat semua/u })).toHaveAttribute(
      "href",
      "/transactions",
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
