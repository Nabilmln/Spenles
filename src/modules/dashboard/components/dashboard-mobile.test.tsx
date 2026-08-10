import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { DailyExpensePoint } from "../types/dashboard";
import { DashboardFeatureGrid } from "./dashboard-feature-grid";
import { MonthlyExpenseCard } from "./monthly-expense-card";
import { RollingThreeDayTransactions } from "./rolling-three-day-transactions";

afterEach(cleanup);

vi.mock("./daily-expense-chart", () => ({
  DailyExpenseChart: () => <div data-testid="daily-chart" />,
}));

const point = (day: string, expenseIdr: string, plot: number): DailyExpensePoint => ({
  day,
  label: day,
  expenseIdr,
  plot,
});

describe("mobile dashboard cards", () => {
  it("renders the horizontal feature navigation with real routes only", () => {
    render(<DashboardFeatureGrid />);

    expect(screen.getByRole("navigation", { name: "Navigasi fitur" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Akun" })).toHaveAttribute("href", "/accounts");
    expect(screen.getByRole("link", { name: "Anggaran" })).toHaveAttribute("href", "/budgets");
    expect(screen.getByRole("link", { name: "Kategori" })).toHaveAttribute("href", "/categories");
    expect(screen.getByRole("link", { name: "Berulang" })).toHaveAttribute("href", "/recurring-transactions");
    expect(screen.queryByRole("link", { name: /Ekspor|Notifikasi/ })).not.toBeInTheDocument();
  });

  it("renders both chart canvases and the monthly total without a mobile add button", () => {
    render(
      <MonthlyExpenseCard
        currentMonth="2026-08"
        monthLabel="Agustus 2026"
        monthPoints={[point("2026-08-01", "50000", 1)]}
        nextMonth="2026-09"
        prevMonth="2026-07"
        recentPoints={[point("2026-08-03", "0", 0)]}
        totalExpense={50000n}
      />,
    );

    expect(screen.getByRole("button", { name: "Agustus 2026" })).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*50\.000/u)).toBeInTheDocument();
    expect(screen.getAllByTestId("daily-chart")).toHaveLength(2);
    expect(screen.getByRole("group", { name: "Pilih bulan" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Tambah transaksi" })).not.toBeInTheDocument();
  });

  it("shows a subtle zero-data message when the recent four days have no expense", () => {
    render(
      <MonthlyExpenseCard
        currentMonth="2026-08"
        monthLabel="Agustus 2026"
        monthPoints={[point("2026-08-01", "0", 0)]}
        nextMonth="2026-09"
        prevMonth="2026-07"
        recentPoints={[point("2026-08-03", "0", 0)]}
        totalExpense={0n}
      />,
    );

    expect(
      screen.getByText("Belum ada pengeluaran dalam 4 hari terakhir."),
    ).toBeInTheDocument();
  });

  it("groups rolling three-day transactions and links to the list", () => {
    const now = new Date();
    render(
      <RollingThreeDayTransactions
        rows={[
          {
            id: "t1",
            type: "expense",
            amountIdr: "12500",
            transactionAt: new Date(now.getTime() - 86_400_000),
            note: "Makan siang",
            accountName: "Kas Utama",
            categoryName: "Makanan",
          },
          {
            id: "t2",
            type: "income",
            amountIdr: "50000",
            transactionAt: now,
            note: null,
            accountName: "Kas Utama",
            categoryName: "Gaji",
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "3 hari terakhir" })).toBeInTheDocument();
    expect(screen.getByText("Hari ini")).toBeInTheDocument();
    expect(screen.getByText("Kemarin")).toBeInTheDocument();
    expect(screen.getByText("Makan siang")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Lihat semua/ })).toHaveAttribute(
      "href",
      "/transactions",
    );
  });

  it("renders an empty state when there are no recent transactions", () => {
    render(<RollingThreeDayTransactions rows={[]} />);

    expect(
      screen.getByText("Belum ada transaksi dalam 3 hari terakhir."),
    ).toBeInTheDocument();
  });
});
