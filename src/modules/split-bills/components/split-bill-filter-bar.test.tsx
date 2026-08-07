import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  activeSplitBillFilterCount,
  SplitBillFilterBar,
} from "./split-bill-filter-bar";
import type { SplitBillFilters } from "../schemas/split-bill-filters";

const base: SplitBillFilters = {
  q: "",
  status: undefined,
  month: undefined,
  sort: "billDate",
  direction: "desc",
  page: 1,
  pageSize: 20,
};

describe("split-bill filter bar", () => {
  it("opens the filter dialog and shows active filter count", () => {
    render(<SplitBillFilterBar filters={base} />);
    expect(
      screen.getByRole("searchbox", { name: "Cari merchant" }),
    ).toBeInTheDocument();
    const open = screen.getByRole("button", { name: "Buka filter" });
    expect(open).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(open);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    expect(
      screen.getByRole("button", { name: "Terapkan Filter" }),
    ).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("counts active filters for badge", () => {
    expect(
      activeSplitBillFilterCount({
        ...base,
        status: "finalized",
        q: "Warung",
        direction: "asc",
      }),
    ).toBe(3);
    expect(activeSplitBillFilterCount(base)).toBe(0);
  });
});