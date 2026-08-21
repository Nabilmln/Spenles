import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChartShell } from "./chart-shell";

describe("dashboard accessible content", () => {
  it("labels the chart title and summary", () => {
    render(
      <ChartShell
        chart={<div aria-hidden="true">visual</div>}
        summary="Total Rp1.000"
        title="Pengeluaran bulanan"
      />,
    );

    expect(screen.getByRole("heading", { name: "Pengeluaran bulanan" })).toBeInTheDocument();
    expect(screen.getByText("Total Rp1.000")).toBeInTheDocument();
  });
});
