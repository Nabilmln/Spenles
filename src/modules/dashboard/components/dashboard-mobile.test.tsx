import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DashboardFeatureGrid } from "./dashboard-feature-grid";
import { RecentActivityCard } from "./recent-activity";

afterEach(cleanup);

vi.mock("@/modules/transactions/components/add-transaction-sheet", () => ({
  AddTransactionSheet: () => null,
}));

describe("mobile dashboard cards", () => {
  it("renders the quick services with real page routes only", () => {
    render(<DashboardFeatureGrid />);

    expect(screen.getByRole("navigation", { name: "Quick services" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Add Expense" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Accounts" })).toHaveAttribute("href", "/accounts");
    expect(screen.getByRole("link", { name: "Split Bill" })).toHaveAttribute("href", "/split-bills");
    expect(screen.getByRole("link", { name: "Categories" })).toHaveAttribute("href", "/categories");
    expect(screen.getByRole("link", { name: "Reports" })).toHaveAttribute("href", "/reports");
    expect(screen.queryByRole("link", { name: /Ekspor|Notifikasi|Add Expense/ })).not.toBeInTheDocument();
  });

  it("shows recent rows without redundant date groups or a title action", () => {
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
            categoryId: "cat-1",
            categoryIcon: "utensils",
          },
          {
            id: "t2",
            type: "income",
            amountIdr: "50000",
            transactionAt: now,
            note: null,
            accountName: "Kas Utama",
            categoryName: "Gaji",
            categoryId: "cat-2",
            categoryIcon: "wallet",
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Recent Activity" })).toBeInTheDocument();
    expect(screen.queryByText("Today")).not.toBeInTheDocument();
    expect(screen.queryByText("Yesterday")).not.toBeInTheDocument();
    expect(screen.getByText("Makan siang")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /View all/ })).not.toBeInTheDocument();
  });

  it("uses each row's category icon instead of the fallback arrow in recent activity", () => {
    const { container } = render(
      <RecentActivityCard
        rows={[
          {
            id: "t1",
            type: "expense",
            amountIdr: "12500",
            transactionAt: new Date(),
            note: "Makan siang",
            accountName: "Kas Utama",
            categoryName: "Makanan",
            categoryId: "cat-1",
            categoryIcon: "utensils",
          },
        ]}
      />,
    );

    expect(container.querySelector(".lucide-utensils")).toBeInTheDocument();
    expect(container.querySelector(".lucide-arrow-right-left")).not.toBeInTheDocument();
    expect(container.querySelector(".lucide-utensils")?.parentElement).toHaveClass("text-foreground", "bg-primary-50");
    expect(screen.getByText(/12\.500/)).toHaveClass("text-amount");
  });

  it("renders an empty state when there are no recent transactions", () => {
    render(<RecentActivityCard rows={[]} />);

    expect(
      screen.getByText("No expenses yet"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Record expense" }),
    ).toBeInTheDocument();
  });
});
