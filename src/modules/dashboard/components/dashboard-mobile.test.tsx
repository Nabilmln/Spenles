import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { DailyExpensePoint } from "../types/dashboard";
import { DashboardFeatureGrid } from "./dashboard-feature-grid";
import { MonthlyExpenseCard } from "./monthly-expense-card";
import { RecentActivityCard } from "./recent-activity";

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

    expect(screen.getByRole("navigation", { name: "Feature navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Add Expense" })).toHaveAttribute("href", "/transactions/new");
    expect(screen.getByRole("link", { name: "Split Bill" })).toHaveAttribute("href", "/split-bills");
    expect(screen.getByRole("link", { name: "Reports" })).toHaveAttribute("href", "/reports");
    expect(screen.getByRole("link", { name: "Accounts" })).toHaveAttribute("href", "/accounts");
    expect(screen.queryByRole("link", { name: /Ekspor|Notifikasi/ })).not.toBeInTheDocument();
  });

  it("renders both chart canvases and the income and expense totals without a mobile add button", () => {
    render(
      <MonthlyExpenseCard
        currentMonth="2026-08"
        monthLabel="Agustus 2026"
        monthPoints={[point("2026-08-01", "50000", 1)]}
        nextMonth="2026-09"
        prevMonth="2026-07"
        recentPoints={[point("2026-08-03", "0", 0)]}
        totalExpense={50000n}
        totalIncome={100000n}
      />,
    );

    expect(screen.getByRole("button", { name: "Agustus 2026" })).toBeInTheDocument();
    expect(screen.getByText("Income")).toBeInTheDocument();
    expect(screen.getByText("Expenses")).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*100\.000/u)).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*50\.000/u)).toBeInTheDocument();
    expect(screen.getAllByTestId("daily-chart")).toHaveLength(2);
    expect(screen.getByRole("group", { name: "Select month" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Tambah transaksi" })).not.toBeInTheDocument();
  });

  it("groups recent activity transactions and links to the list", () => {
    const now = new Date();
    render(
      <RecentActivityCard
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

    expect(screen.getByRole("heading", { name: "Recent activity" })).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Yesterday")).toBeInTheDocument();
    expect(screen.getByText("Makan siang")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View all/ })).toHaveAttribute(
      "href",
      "/transactions",
    );
  });

  it("renders an empty state when there are no recent transactions", () => {
    render(<RecentActivityCard rows={[]} />);

    expect(
      screen.getByText("No expenses yet"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Record expense" }),
    ).toHaveAttribute("href", "/transactions/new");
  });
});
