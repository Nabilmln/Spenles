import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MobileBalanceCard } from "./mobile-balance-card";

afterEach(cleanup);

const findAmount = (value: string) =>
  screen.getAllByText(
    (_, element) => element?.textContent?.replace(/\s/gu, "") === value,
  ).length > 0;

describe("MobileBalanceCard", () => {
  it("renders the total balance with income and expense", () => {
    render(
      <MobileBalanceCard
        name="Pengguna Spenles"
        balance={5_487_508n}
        income={2_000_000n}
        expense={800_000n}
      />,
    );

    expect(screen.getByText("Total balance")).toBeInTheDocument();
    expect(findAmount("Rp5.487.508")).toBe(true);
    expect(findAmount("Rp2.000.000")).toBe(true);
    expect(findAmount("Rp800.000")).toBe(true);
  });

  it("toggles the nominal visibility", () => {
    render(
      <MobileBalanceCard
        name="Pengguna Spenles"
        balance={5_487_508n}
        income={2_000_000n}
        expense={800_000n}
      />,
    );

    const button = screen.getByRole("button", {
      name: "Hide amount",
    });
    fireEvent.click(button);

    expect(screen.getByRole("button", { name: "Show amount" })).toBeInTheDocument();
    expect(screen.getAllByText(/•+$/u).length).toBeGreaterThanOrEqual(1);
  });
});