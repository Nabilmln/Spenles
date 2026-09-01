import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChartShell } from "./chart-shell";

describe("dashboard accessible content", () => {
  it("labels the chart title and summary", () => {
    render(
      <ChartShell
        chart={<div aria-hidden="true">visual</div>}
        summary="Total Rp1.000"
        title="Monthly expenses"
      />,
    );

    expect(screen.getByRole("heading", { name: "Monthly expenses" })).toBeInTheDocument();
    expect(screen.getByText("Total Rp1.000")).toBeInTheDocument();
  });
});
