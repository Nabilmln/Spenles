import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { ReportMonth } from "../types";
import { buildCashFlowPoints, ReportCashFlow } from "./report-cash-flow";
import { ReportToolbar } from "./report-toolbar";

afterEach(cleanup);

vi.mock("@/modules/dashboard", () => ({
  IncomeExpenseChart: () => <div data-testid="cash-flow-chart" />,
  ChartShell: ({ chart }: { chart: ReactNode }) => (
    <figure>{chart}</figure>
  ),
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

  it("labels monthly series with a short month name", () => {
    const series: ReportMonth[] = [
      { month: "2026-08", incomeIdr: "0", expenseIdr: "5000" },
    ];
    const points = buildCashFlowPoints(series);
    expect(points[0].label).toMatch(/^Agu/u);
  });

  it("handles an all-zero series without dividing by zero", () => {
    const points = buildCashFlowPoints([{ month: "2026-08", incomeIdr: "0", expenseIdr: "0" }]);
    expect(points[0].incomePlot).toBe(0);
    expect(points[0].expensePlot).toBe(0);
  });
});

describe("report cash flow card", () => {
  it("renders the chart and range", () => {
    render(
      <ReportCashFlow
        from="2026-08-01"
        to="2026-08-07"
        points={buildCashFlowPoints([{ month: "2026-08", incomeIdr: "100", expenseIdr: "50" }])}
        incomeIdr="100"
        expenseIdr="50"
        daily={false}
      />,
    );
    expect(screen.getByText("Arus Kas")).toBeInTheDocument();
    expect(screen.getByTestId("cash-flow-chart")).toBeInTheDocument();
  });

  it("shows a zero-data hint when every point is zero", () => {
    render(
      <ReportCashFlow
        from="2026-08-01"
        to="2026-08-07"
        points={buildCashFlowPoints([{ month: "2026-08", incomeIdr: "0", expenseIdr: "0" }])}
        incomeIdr="0"
        expenseIdr="0"
        daily={false}
      />,
    );
    expect(screen.getByText("Belum ada data pada periode ini.")).toBeInTheDocument();
  });
});

describe("report toolbar", () => {
  it("shows the current range and opens the range sheet", () => {
    render(<ReportToolbar from="2026-08-01" to="2026-08-07" pdfHref="/pdf" csvHref="/csv" />);

    expect(screen.getByText("1 Agu – 7 Agu")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Pilih rentang tanggal/ }));
    expect(screen.getByRole("dialog", { name: "Pilih rentang tanggal" })).toBeInTheDocument();
  });

  it("opens the export sheet with PDF and CSV links", () => {
    render(
      <ReportToolbar
        from="2026-08-01"
        to="2026-08-07"
        pdfHref="/pdf"
        csvHref="/csv"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Ekspor laporan" }));
    expect(screen.getByRole("dialog", { name: "Ekspor laporan" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Export PDF" })).toHaveAttribute("href", "/pdf");
    expect(screen.getByRole("link", { name: "Export CSV" })).toHaveAttribute("href", "/csv");
  });
});