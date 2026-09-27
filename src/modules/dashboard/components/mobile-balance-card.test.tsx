import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MobileBalanceCard } from "./mobile-balance-card";

afterEach(cleanup);

const findAmount = (value: string) =>
  screen.getAllByText(
    (_, element) => element?.textContent?.replace(/\s/gu, "") === value,
  ).length > 0;

describe("MobileBalanceCard", () => {
  it("renders the balance without income and expense totals", () => {
    render(
      <MobileBalanceCard
        balance={5_487_508n}
      />,
    );

    expect(screen.getByText("Balance:")).toBeInTheDocument();
    expect(findAmount("Rp5.487.508")).toBe(true);
    expect(screen.queryByText("Income")).not.toBeInTheDocument();
    expect(screen.queryByText("Expense")).not.toBeInTheDocument();
  });

  it("toggles the nominal visibility", () => {
    render(
      <MobileBalanceCard
        balance={5_487_508n}
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
