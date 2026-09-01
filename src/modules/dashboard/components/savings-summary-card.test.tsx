import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SavingsSummaryCard } from "./savings-summary-card";

afterEach(cleanup);

describe("SavingsSummaryCard", () => {
  it("renders balance and signed period net savings", () => {
    render(<SavingsSummaryCard balance={1500000n} periodNet={250000n} />);

    expect(
      screen.getByRole("region", { name: "Savings summary" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*1\.500\.000/u)).toBeInTheDocument();
    expect(screen.getByText(/\+ Rp\s*250\.000/u)).toBeInTheDocument();
  });

  it("shows a negative sign when savings were withdrawn more than added", () => {
    render(<SavingsSummaryCard balance={900000n} periodNet={-100000n} />);

    expect(screen.getByText(/- Rp\s*100\.000/u)).toBeInTheDocument();
  });

  it("shows an empty state when there is no savings activity", () => {
    render(<SavingsSummaryCard balance={0n} periodNet={0n} />);

    expect(screen.getByText("No savings yet.")).toBeInTheDocument();
  });
});