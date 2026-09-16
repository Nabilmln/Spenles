import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("react-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-dom")>();
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

vi.mock("../actions/budget-actions", () => ({
  deleteBudgetAction: vi.fn(),
}));
import { BudgetList } from "./budget-list";

const monthlyRow = {
  id: "11111111-1111-4111-8111-111111111111",
  categoryId: "22222222-2222-4222-8222-222222222222",
  categoryName: "Makanan",
  categoryIcon: null,
  periodType: "monthly" as const,
  periodStart: null,
  periodEnd: null,
  amount: "100000",
  warningThresholdBps: 8000,
  warningDaysRemaining: null,
  recordStatus: "active" as const,
  usage: "80000",
  remaining: "20000",
  percentageBps: "8000",
  budgetStatus: "warning" as const,
  daysRemainingInPeriod: 10,
};

afterEach(cleanup);

describe("BudgetList", () => {
  it("exposes status text and accessible progress values", () => {
    render(
      <BudgetList rows={[monthlyRow]} onEdit={() => {}} />,
    );
    expect(screen.getByText("Near limit")).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: "Budget usage for Makanan" }),
    ).toHaveAttribute("aria-valuetext", "80% used");
  });

  it("shows usage versus amount alongside the period badge", () => {
    render(
      <BudgetList rows={[monthlyRow]} onEdit={() => {}} />,
    );
    expect(screen.getAllByText("Rp 80.000").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/10 days left/).length).toBeGreaterThan(0);
  });

  it("renders the empty state when there are no rows", () => {
    render(<BudgetList rows={[]} onEdit={() => {}} />);
    expect(
      screen.getByText(/No budgets yet/i),
    ).toBeInTheDocument();
  });

  it("opens the action sheet and triggers edit", async () => {
    const onEdit = vi.fn();
    render(<BudgetList rows={[monthlyRow]} onEdit={onEdit} />);
    fireEvent.click(screen.getByRole("button", { name: "Budget actions" }));
    fireEvent.click(screen.getByRole("button", { name: /Edit Budget/i }));
    expect(onEdit).toHaveBeenCalledWith(monthlyRow);
  });

  it("opens a delete confirmation after choosing delete", async () => {
    render(<BudgetList rows={[monthlyRow]} onEdit={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Budget actions" }));
    fireEvent.click(screen.getByRole("button", { name: /Delete Budget/i }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText(/Delete budget\?/i)).toBeInTheDocument();
  });
});