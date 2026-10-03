import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { ReportMonth } from "../types";
import { buildCashFlowPoints, ReportCashFlow } from "./report-cash-flow";
import { ReportToolbar } from "./report-toolbar";

vi.mock("../actions/email-report", () => ({
  emailReportAction: vi.fn(async () => ({ success: "Report queued." })),
}));

const reportToolbarProps = {
  from: "2026-08-01",
  to: "2026-08-07",
  email: "user@example.com",
  accounts: [{ id: "11111111-1111-4111-8111-111111111111", name: "Main account" }],
};

afterEach(cleanup);

vi.mock("@/modules/dashboard", () => ({
  ChartShell: ({ chart }: { chart: ReactNode }) => (
    <figure>{chart}</figure>
  ),
}));

vi.mock("./report-cash-flow-chart", () => ({
  ReportCashFlowChart: ({ from, to, points }: { from: string; to: string; points: unknown[] }) => <div data-testid="cash-flow-chart" data-from={from} data-to={to} data-points={points.length} />,
}));

describe("cash flow grouping", () => {
  it("fills missing days inside the selected date range", () => {
    const series: ReportMonth[] = [
      { month: "2026-08-01", incomeIdr: "0", expenseIdr: "5000" },
      { month: "2026-08-03", incomeIdr: "1000", expenseIdr: "0" },
    ];
    const points = buildCashFlowPoints(series, { from: "2026-08-01", to: "2026-08-03", daily: true });
    expect(points).toHaveLength(3);
    expect(points[0].incomePlot).toBe(0);
    expect(points[0].expensePlot).toBe(1);
    expect(points[1]).toMatchObject({ period: "2026-08-02", incomeIdr: "0", expenseIdr: "0" });
    expect(points[2].incomePlot).toBe(0.2);
    expect(points[2].label).toContain("2026");
  });

  it("fills missing months inside a longer selected range", () => {
    const series: ReportMonth[] = [
      { month: "2026-08", incomeIdr: "0", expenseIdr: "5000" },
    ];
    const points = buildCashFlowPoints(series, { from: "2026-01-15", to: "2026-12-20", daily: false });
    expect(points).toHaveLength(12);
    expect(points[0]).toMatchObject({ period: "2026-01", incomeIdr: "0", expenseIdr: "0" });
    expect(points[7].label).toBe("August 2026");
    expect(points[11].period).toBe("2026-12");
  });

  it("handles an all-zero series without dividing by zero", () => {
    const points = buildCashFlowPoints([{ month: "2026-08-01", incomeIdr: "0", expenseIdr: "0" }], { from: "2026-08-01", to: "2026-08-01", daily: true });
    expect(points[0].incomePlot).toBe(0);
    expect(points[0].expensePlot).toBe(0);
  });
});

describe("report cash flow card", () => {
  it("renders the chart card", () => {
    render(
      <ReportCashFlow
        points={buildCashFlowPoints([{ month: "2026-08-01", incomeIdr: "100", expenseIdr: "50" }], { from: "2026-08-01", to: "2026-08-07", daily: true })}
        from="2026-08-01"
        to="2026-08-07"
      />,
    );
    expect(screen.getByRole("region", { name: "Cash flow" })).toBeInTheDocument();
    expect(screen.getByTestId("cash-flow-chart")).toBeInTheDocument();
    expect(screen.getByTestId("cash-flow-chart")).toHaveAttribute("data-from", "2026-08-01");
    expect(screen.getByTestId("cash-flow-chart")).toHaveAttribute("data-to", "2026-08-07");
    expect(screen.getByTestId("cash-flow-chart")).toHaveAttribute("data-points", "7");
  });

  it("keeps the zero-value chart visible when every point is zero", () => {
    render(
      <ReportCashFlow
        points={buildCashFlowPoints([{ month: "2026-08-01", incomeIdr: "0", expenseIdr: "0" }], { from: "2026-08-01", to: "2026-08-01", daily: true })}
        from="2026-08-01"
        to="2026-08-01"
      />,
    );
    expect(screen.getByTestId("cash-flow-chart")).toHaveAttribute("data-points", "1");
  });
});

describe("report toolbar", () => {
  it("shows the current range and opens the range sheet", () => {
    render(
      <ReportToolbar
        {...reportToolbarProps}
      />,
    );

    const dateButton = screen.getByRole("button", { name: /Select date range/ });
    expect(within(dateButton).getByText("1 Aug 26")).toBeInTheDocument();
    expect(within(dateButton).getByText("-")).toBeInTheDocument();
    expect(within(dateButton).getByText("7 Aug 26")).toBeInTheDocument();
    expect(within(dateButton).queryByText("Select date")).not.toBeInTheDocument();
    expect(dateButton.firstElementChild?.firstElementChild?.tagName.toLowerCase()).toBe("svg");
    fireEvent.click(dateButton);
    expect(screen.getByRole("dialog", { name: "Select date range" })).toBeInTheDocument();
  });

  it("keeps the range sheet open while picking calendar days", () => {
    render(
      <ReportToolbar
        {...reportToolbarProps}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Select date range/ }));
    const dialog = screen.getByRole("dialog", { name: "Select date range" });
    const day = within(dialog).getByRole("button", { name: "3 August 2026" });
    fireEvent.click(day);

    expect(day).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("dialog", { name: "Select date range" })).toBeInTheDocument();
  });

  it("opens the export sheet with recipient, account, date, and send controls", () => {
    render(
      <ReportToolbar
        {...reportToolbarProps}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Export report" }));
    expect(screen.getByRole("dialog", { name: "Export report" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export report" }).textContent).toBe("");
    expect(screen.getByRole("textbox", { name: "Send to" })).toHaveValue("user@example.com");
    const accountButton = screen.getByRole("button", { name: "Source account Choose an account" });
    expect(accountButton).toHaveTextContent("Choose an account");
    expect(screen.getByRole("button", { name: "Email report" })).toBeDisabled();
    fireEvent.click(accountButton);
    const accountDialog = screen.getByRole("dialog", { name: "Select account" });
    fireEvent.click(within(accountDialog).getByRole("button", { name: "Main account" }));
    expect(accountButton).toHaveTextContent("Main account");
    expect(screen.getByRole("button", { name: "Email report" })).toBeEnabled();
    expect(document.querySelector('input[name="accountId"]')).toHaveValue(reportToolbarProps.accounts[0].id);
    expect(screen.getByRole("button", { name: "Email report" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Choose report date range" }));
    expect(screen.getByRole("dialog", { name: "Report dates" })).toBeInTheDocument();
  });
});
