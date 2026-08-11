import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AverageSpendingCard } from "./average-spending-card";

afterEach(cleanup);

describe("AverageSpendingCard", () => {
  it("renders the computed daily average and unit label", () => {
    render(
      <AverageSpendingCard
        value={50000n}
        changeBps={null}
        previousLabel="Juli 2026"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Pengeluaran per hari" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*50\.000/u)).toBeInTheDocument();
    expect(screen.getByText("per hari")).toBeInTheDocument();
  });

  it("shows a comparison when the previous baseline exists", () => {
    render(
      <AverageSpendingCard
        value={50000n}
        changeBps="840"
        previousLabel="Juli 2026"
      />,
    );

    expect(
      screen.getByText(/▲ 8,40% dibanding Juli 2026/),
    ).toBeInTheDocument();
  });

  it("omits change text when no percentage is available", () => {
    render(
      <AverageSpendingCard
        value={0n}
        changeBps={null}
        previousLabel="Juli 2026"
      />,
    );

    expect(screen.queryByText(/dibanding/)).not.toBeInTheDocument();
  });
});