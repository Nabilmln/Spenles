import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DashboardGreeting } from "./dashboard-greeting";

afterEach(cleanup);

describe("DashboardGreeting", () => {
  it("keeps a friendly personalized greeting", () => {
    render(<DashboardGreeting name="Nabil" />);
    const heading = screen.getByRole("heading", { name: "Halo, Nabil" });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText("Nabil")).toBeInTheDocument();
  });

  it("removes the explicit Dashboard title and no redundant Home heading", () => {
    render(<DashboardGreeting name="Nabil" />);
    expect(screen.queryByRole("heading", { name: "Dashboard" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Beranda" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Home" })).not.toBeInTheDocument();
  });

  it("greets a default label when no profile name is available", () => {
    render(<DashboardGreeting name="Pengguna Spenles" />);
    expect(screen.getByRole("heading", { name: "Halo, Pengguna Spenles" })).toBeInTheDocument();
  });
});