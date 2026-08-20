import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardAccountCard } from "./dashboard-account-card";

const row = (id: string, overrides: Partial<Parameters<typeof DashboardAccountCard>[0]["rows"][number]> = {}) => ({
  id,
  name: `Akun ${id}`,
  type: "cash" as const,
  balance: "150000",
  ...overrides,
});

describe("DashboardAccountCard", () => {
  it("renders account rows with type label, balance, and link", () => {
    render(
      <DashboardAccountCard
        rows={[
          row("a1", { name: "Kas Utama", type: "cash", balance: "12500" }),
          row("a2", { name: "Rekening BCA", type: "bank", balance: "2500000" }),
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Akun yang digunakan" })).toBeInTheDocument();
    expect(screen.getByText("Kas Utama")).toBeInTheDocument();
    expect(screen.getByText("Rekening BCA")).toBeInTheDocument();
    expect(screen.getByText("Tunai")).toBeInTheDocument();
    expect(screen.getByText("Rekening bank")).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*12\.500/u)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Lihat akun/u })).toHaveAttribute("href", "/accounts");
  });

  it("caps displayed accounts at five and reports the rest", () => {
    render(
      <DashboardAccountCard
        rows={["a1", "a2", "a3", "a4", "a5", "a6"].map((id) => row(id))}
      />,
    );

    expect(screen.getByText("+1 akun lainnya")).toBeInTheDocument();
    expect(screen.queryByText("Akun a6")).not.toBeInTheDocument();
  });

  it("renders an empty state when there are no active accounts", () => {
    render(<DashboardAccountCard rows={[]} />);

    expect(
      screen.getByText("Belum ada akun. Buat akun di menu Akun."),
    ).toBeInTheDocument();
  });
});