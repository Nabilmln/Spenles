import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CategoryAnalysis } from "./category-analysis";
import { CompactReportSummary } from "./compact-report-summary";
import { ReportInsightCard } from "./report-insight-card";

afterEach(cleanup);

describe("compact report summary", () => {
  it("shows income, expense and net difference", () => {
    render(
      <CompactReportSummary
        totals={{ incomeIdr: "150000", expenseIdr: "40000", netIdr: "110000" }}
      />,
    );

    expect(screen.getByRole("region", { name: "Ikhtisar periode" })).toBeInTheDocument();
    expect(screen.getByText("Pendapatan")).toBeInTheDocument();
    expect(screen.getByText("Pengeluaran")).toBeInTheDocument();
    expect(screen.getByText("Selisih")).toBeInTheDocument();
    expect(screen.getAllByText(/Rp\s*150\.000/u)).toHaveLength(1);
    expect(screen.getAllByText(/Rp\s*40\.000/u)).toHaveLength(1);
    expect(screen.getByText(/Rp\s*110\.000/u)).toBeInTheDocument();
  });

  it("marks a negative net difference as deficit", () => {
    const { container } = render(
      <CompactReportSummary
        totals={{ incomeIdr: "0", expenseIdr: "50000", netIdr: "-50000" }}
      />,
    );
    expect(
      container.querySelector(".report-summary-net-negative"),
    ).not.toBeNull();
  });

  it("marks a positive net difference as surplus", () => {
    const { container } = render(
      <CompactReportSummary
        totals={{ incomeIdr: "0", expenseIdr: "0", netIdr: "1000" }}
      />,
    );
    expect(
      container.querySelector(".report-summary-net-positive"),
    ).not.toBeNull();
  });
});

describe("report insight card", () => {
  it("renders the average daily expense", () => {
    render(
      <ReportInsightCard
        insight={{ averageDailyExpenseIdr: "25000", inclusiveDays: 30 }}
      />,
    );
    expect(
      screen.getByRole("region", { name: "Wawasan keuangan" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Rata-rata pengeluaran per hari kamu adalah/u)).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*25\.000/u)).toBeInTheDocument();
  });
});

describe("category analysis", () => {
  const base = {
    categories: [
      {
        categoryId: "cat-1",
        name: "Makanan",
        amountIdr: "30000",
        shareBps: 6000,
      },
      {
        categoryId: "cat-2",
        name: "Transport",
        amountIdr: "20000",
        shareBps: 4000,
      },
    ],
    from: "2026-08-01",
    to: "2026-08-07",
  };

  it("lists expense categories with percentage shares", () => {
    render(<CategoryAnalysis {...base} type="expense" totalIdr="50000" />);

    expect(screen.getByRole("heading", { name: "Pengeluaran per Kategori" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Makanan/ })).toHaveAttribute(
      "href",
      "/reports/categories/cat-1?from=2026-08-01&to=2026-08-07",
    );
    expect(screen.getByRole("link", { name: /Transport/ })).toBeInTheDocument();
  });

  it("shows zero percentages when total is zero", () => {
    render(
      <CategoryAnalysis
        {...base}
        type="expense"
        totalIdr="0"
      />,
    );
    expect(screen.getAllByText("0%")).toHaveLength(2);
  });

  it("opens the filter sheet with the correct active type", () => {
    render(<CategoryAnalysis {...base} type="expense" totalIdr="50000" />);

    fireEvent.click(screen.getByRole("button", { name: "Buka filter kategori" }));
    expect(
      screen.getByRole("dialog", { name: "Filter kategori" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pemasukan" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "Pengeluaran" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("shows a zero-data message when there are no categories", () => {
    render(
      <CategoryAnalysis
        categories={[]}
        from="2026-08-01"
        to="2026-08-07"
        type="expense"
        totalIdr="0"
      />,
    );
    expect(
      screen.getByText("Belum ada pengeluaran pada periode ini."),
    ).toBeInTheDocument();
  });
});