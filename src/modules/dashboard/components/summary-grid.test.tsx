import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { buildFinancialSnapshot } from "../services/financial-metrics";
import { SummaryGrid } from "./summary-grid";

describe("SummaryGrid", () => {
  it("renders exact totals and safe zero-baseline comparison text", () => {
    const snapshot = buildFinancialSnapshot(
      { income: 1_000_000n, expense: 250_000n },
      { income: 0n, expense: 0n },
      [{ period: "2026-08", income: 1_000_000n, expense: 250_000n }],
      [],
      1,
    );
    render(<SummaryGrid previousLabel="Juli 2026" snapshot={snapshot} />);

    expect(screen.getByRole("heading", { name: "Total pemasukan" })).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*1\.000\.000/u)).toBeInTheDocument();
    expect(screen.getAllByText(/Aktivitas baru/u)).toHaveLength(3);
    expect(screen.queryByText(/Infinity/u)).not.toBeInTheDocument();
  });

  it("explains an unavailable negative-net percentage with an exact delta", () => {
    const snapshot = buildFinancialSnapshot(
      { income: 20n, expense: 30n },
      { income: 10n, expense: 20n },
      [{ period: "2026-08", income: 20n, expense: 30n }],
      [],
      1,
    );
    render(<SummaryGrid previousLabel="Juli 2026" snapshot={snapshot} />);

    expect(screen.getByText(/persentase tidak tersedia/u)).toBeInTheDocument();
  });
});
