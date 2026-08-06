import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TransactionSummary } from "./transaction-summary";

afterEach(cleanup);

describe("TransactionSummary", () => {
  it("renders one compact row with three equal sections and exact values", () => {
    const { container } = render(
      <TransactionSummary
        income={1_000_000n}
        expense={250_000n}
        savings={125_000n}
      />,
    );

    const region = screen.getByRole("region", { name: "Ringkasan periode" });
    expect(region).toHaveClass("tx-summary");
    expect(region).toHaveClass("card");
    expect(container.querySelectorAll(".tx-summary-section")).toHaveLength(3);
    expect(screen.getByText("Pendapatan")).toBeInTheDocument();
    expect(screen.getByText("Pengeluaran")).toBeInTheDocument();
    expect(screen.getByText("Tabungan")).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*1\.000\.000/u)).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*250\.000/u)).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*125\.000/u)).toBeInTheDocument();
    expect(screen.queryByText("Tambah transaksi")).not.toBeInTheDocument();
  });

  it("keeps a negative savings value on its own signed line", () => {
    render(<TransactionSummary income={0n} expense={0n} savings={-25_000n} />);

    expect(screen.getByText(/\u2212\s*Rp\s*25\.000/u)).toBeInTheDocument();
    expect(screen.getByText("Tabungan")).toBeInTheDocument();
  });
});
