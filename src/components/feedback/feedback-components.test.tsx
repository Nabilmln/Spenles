import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./empty-state";
import { LoadingState } from "./loading-state";

describe("foundational feedback components", () => {
  it("renders an honest Phase 01 empty state", () => {
    render(<EmptyState />);
    expect(screen.getByRole("heading", { name: "Belum ada aktivitas keuangan" })).toBeInTheDocument();
    expect(screen.queryByText(/Rp\s?\d/)).not.toBeInTheDocument();
  });

  it("announces loading status", () => {
    render(<LoadingState label="Menyiapkan akun..." />);
    expect(screen.getByRole("status")).toHaveTextContent("Menyiapkan akun...");
  });
});
