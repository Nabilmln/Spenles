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
  ReportCashFlowChart: () => <div data-testid="cash-flow-chart" />,
}));

describe("cash flow grouping", () => {
  it("labels short daily series without a year", () => {
    const series: ReportMonth[] = [
      { month: "2026-08-01", incomeIdr: "0", expenseIdr: "5000" },
      { month: "2026-08-02", incomeIdr: "1000", expenseIdr: "0" },
    ];
    const points = buildCashFlowPoints(series);
    expect(points).toHaveLength(2);
    expect(points[0].incomePlot).toBe(0);
    expect(points[0].expensePlot).toBe(1);
    expect(points[1].incomePlot).toBe(0.2);
  });

  it("labels monthly series with a long month name", () => {
    const series: ReportMonth[] = [
      { month: "2026-08", incomeIdr: "0", expenseIdr: "5000" },
    ];
    const points = buildCashFlowPoints(series);
    expect(points[0].label).toMatch(/^August/u);
  });

  it("handles an all-zero series without dividing by zero", () => {
    const points = buildCashFlowPoints([{ month: "2026-08", incomeIdr: "0", expenseIdr: "0" }]);
    expect(points[0].incomePlot).toBe(0);
    expect(points[0].expensePlot).toBe(0);
  });
});

describe("report cash flow card", () => {
  it("renders the chart card", () => {
    render(
      <ReportCashFlow
        points={buildCashFlowPoints([{ month: "2026-08", incomeIdr: "100", expenseIdr: "50" }])}
      />,
    );
    expect(screen.getByRole("region", { name: "Cash flow" })).toBeInTheDocument();
    expect(screen.getByTestId("cash-flow-chart")).toBeInTheDocument();
  });

  it("shows a zero-data hint when every point is zero", () => {
    render(
      <ReportCashFlow
        points={buildCashFlowPoints([{ month: "2026-08", incomeIdr: "0", expenseIdr: "0" }])}
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
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Select date range/ }));
    const dialog = screen.getByRole("dialog", { name: "Select date range" });
    const day = within(dialog).getByRole("button", { name: "3 August 2026" });
    fireEvent.click(day);

    expect(day).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("dialog", { name: "Select date range" })).toBeInTheDocument();
  });

  it("opens the export sheet with a blob PDF preview and a download button", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(new Blob(["%PDF-test"], { type: "application/pdf" })),
      ),
    );
    const createObjectURL = vi.fn(() => "blob:report-preview");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });

    render(
      <ReportToolbar
        from="2026-08-01"
        to="2026-08-07"
        pdfHref="/pdf"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Export report" }));
    expect(screen.getByRole("dialog", { name: "Export report" })).toBeInTheDocument();
    const preview = await screen.findByTitle("Report preview");
    expect(preview).toHaveAttribute("src", "blob:report-preview");
    expect(fetch).toHaveBeenCalledWith("/pdf");
    const download = screen.getByRole("link", { name: "Download PDF" });
    expect(download).toHaveAttribute("href", "/pdf");
    expect(screen.queryByRole("link", { name: "Export CSV" })).toBeNull();
  });
});