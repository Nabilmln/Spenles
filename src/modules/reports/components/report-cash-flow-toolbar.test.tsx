import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { ReportMonth } from "../types";
import { buildCashFlowPoints, ReportCashFlow } from "./report-cash-flow";
import { ReportToolbar } from "./report-toolbar";

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

  it("shows a zero-data hint when every point is zero", () => {
    render(
      <ReportCashFlow
        points={buildCashFlowPoints([{ month: "2026-08-01", incomeIdr: "0", expenseIdr: "0" }], { from: "2026-08-01", to: "2026-08-01", daily: true })}
        from="2026-08-01"
        to="2026-08-01"
      />,
    );
    expect(screen.getByText("No data available for this period.")).toBeInTheDocument();
  });
});

describe("report toolbar", () => {
  it("shows the current range and opens the range sheet", () => {
    render(
      <ReportToolbar
        from="2026-08-01"
        to="2026-08-07"
        pdfHref="/pdf"
        pdfPreviewHref="/pdf?preview=1"
      />,
    );

    expect(screen.getByText("1 Aug – 7 Aug 2026")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Select date range/ }));
    expect(screen.getByRole("dialog", { name: "Select date range" })).toBeInTheDocument();
  });

  it("keeps the range sheet open while picking calendar days", () => {
    render(
      <ReportToolbar
        from="2026-08-01"
        to="2026-08-07"
        pdfHref="/pdf"
        pdfPreviewHref="/pdf?preview=1"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Select date range/ }));
    const dialog = screen.getByRole("dialog", { name: "Select date range" });
    const day = within(dialog).getByRole("button", { name: "3 August 2026" });
    fireEvent.click(day);

    expect(day).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("dialog", { name: "Select date range" })).toBeInTheDocument();
  });

  it("opens the export sheet with an inline PDF preview and a download button", () => {
    render(
      <ReportToolbar
        from="2026-08-01"
        to="2026-08-07"
        pdfHref="/pdf"
        pdfPreviewHref="/pdf?preview=1"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Export report" }));
    expect(screen.getByRole("dialog", { name: "Export report" })).toBeInTheDocument();
    const preview = screen.getByTitle("Report preview");
    expect(preview).toHaveAttribute("src", "/pdf?preview=1");
    const download = screen.getByRole("link", { name: "Download PDF" });
    expect(download).toHaveAttribute("href", "/pdf");
    expect(screen.queryByRole("link", { name: "Export CSV" })).toBeNull();
  });
});
