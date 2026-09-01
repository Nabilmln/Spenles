import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./empty-state";
import { LoadingState } from "./loading-state";

describe("foundational feedback components", () => {
  it("renders an honest Phase 01 empty state", () => {
    render(<EmptyState />);
    expect(screen.getByRole("heading", { name: "No financial activity yet" })).toBeInTheDocument();
    expect(screen.queryByText(/Rp\s?\d/)).not.toBeInTheDocument();
  });

  it("renders a customized empty state with action", () => {
    render(
      <EmptyState
        title="No Split Bill history yet"
        description="Buat Split Bill pertamamu."
        action={<button type="button">Buat Split Bill</button>}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "No Split Bill history yet" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Buat Split Bill" }),
    ).toBeInTheDocument();
  });

  it("announces loading status", () => {
    render(<LoadingState label="Menyiapkan akun..." />);
    expect(screen.getByRole("status")).toHaveTextContent("Menyiapkan akun...");
  });
});
