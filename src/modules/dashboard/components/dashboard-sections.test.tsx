import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AccountBalanceRow } from "@/modules/accounts";
import { DashboardBalanceSection } from "./dashboard-sections";

vi.mock("./recent-activity", () => ({ RecentActivityCard: () => null }));

afterEach(cleanup);

const accounts: AccountBalanceRow[] = [
  { id: "first", name: "Cash", type: "cash", status: "active", systemKey: null, openingBalance: "0", balance: "12000" },
  { id: "second", name: "Bank", type: "bank", status: "archived", systemKey: null, openingBalance: "0", balance: "34000" },
];

describe("DashboardBalanceSection", () => {
  it("shows the chosen account balance, including a formerly archived account", async () => {
    render(await DashboardBalanceSection({ accountsPromise: Promise.resolve(accounts), homeAccountId: "second" }));
    expect(screen.getByText("Rp 34.000")).toBeInTheDocument();
    expect(screen.queryByText("Rp 46.000")).not.toBeInTheDocument();
  });

  it("falls back to the first owned account if the saved choice is missing", async () => {
    render(await DashboardBalanceSection({ accountsPromise: Promise.resolve(accounts), homeAccountId: null }));
    expect(screen.getByText("Rp 12.000")).toBeInTheDocument();
  });
});
