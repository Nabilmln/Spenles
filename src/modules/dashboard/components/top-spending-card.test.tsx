import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { CategoryAggregate } from "../types/dashboard";
import { TopSpendingCard } from "./top-spending-card";

afterEach(cleanup);

const rows: CategoryAggregate[] = [
  {
    categoryId: "cat-1",
    name: "Makanan",
    normalizedName: "makanan",
    color: null,
    icon: null,
    expense: 250000n,
  },
  {
    categoryId: "cat-2",
    name: "Transportasi",
    normalizedName: "transportasi",
    color: null,
    icon: null,
    expense: 50000n,
  },
];

describe("TopSpendingCard", () => {
  it("renders the top categories with amounts and detail links", () => {
    render(<TopSpendingCard periodLabel="Agustus 2026" rows={rows} />);

    expect(
      screen.getByRole("heading", { name: "Top Pengeluaran" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Agustus 2026")).toBeInTheDocument();
    expect(screen.getByText("Makanan")).toBeInTheDocument();
    expect(screen.getByText("Transportasi")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Makanan/ }),
    ).toHaveAttribute("href", "/reports/categories/cat-1");
    expect(
      screen.getByRole("link", { name: /Transportasi/ }),
    ).toHaveAttribute("href", "/reports/categories/cat-2");
    expect(screen.getByRole("link", { name: "Lihat laporan" })).toHaveAttribute(
      "href",
      "/reports",
    );
  });

  it("shows an empty state when there are no categories", () => {
    render(<TopSpendingCard periodLabel="Agustus 2026" rows={[]} />);

    expect(
      screen.getByText("Belum ada pengeluaran pada periode ini."),
    ).toBeInTheDocument();
  });
});