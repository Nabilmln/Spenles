import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PeriodSelector } from "./period-selector";

describe("PeriodSelector", () => {
  it("renders accessible canonical period controls", () => {
    render(
      <PeriodSelector
        defaultMonth="2026-08"
        filters={{
          selection: { kind: "preset", period: "last-3-months" },
          chartRange: "12-months",
        }}
        selectedLabel="3 bulan terakhir"
      />,
    );

    expect(screen.getByRole("heading", { name: "3 bulan terakhir" })).toBeInTheDocument();
    expect(screen.getByLabelText("Periode cepat")).toHaveValue("last-3-months");
    expect(screen.getByLabelText("Rentang grafik")).toHaveValue("12-months");
    expect(screen.getByLabelText("Bulan spesifik")).toHaveValue("2026-08");
    expect(screen.getByLabelText("Dari tanggal")).toBeRequired();
    expect(screen.getByLabelText("Sampai tanggal")).toBeRequired();
  });
});
