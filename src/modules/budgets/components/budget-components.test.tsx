import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../actions/budget-actions", () => ({
  archiveBudgetAction: vi.fn(),
  restoreBudgetAction: vi.fn(),
}));
import { BudgetList } from "./budget-list";

describe("BudgetList", () => {
  it("exposes status text and accessible progress values", () => {
    render(
      <BudgetList
        rows={[
          {
            id: "11111111-1111-4111-8111-111111111111",
            categoryId: "22222222-2222-4222-8222-222222222222",
            categoryName: "Makanan",
            month: "2026-08",
            amount: "100000",
            warningThresholdBps: 8000,
            recordStatus: "active",
            usage: "80000",
            remaining: "20000",
            percentageBps: "8000",
            budgetStatus: "warning",
          },
        ]}
      />,
    );
    expect(screen.getByText("Near limit")).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: "Budget usage for Makanan" }),
    ).toHaveAttribute("aria-valuetext", "80% used");
  });
});
