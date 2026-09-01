import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../actions/account-actions", () => ({
  archiveAccountAction: vi.fn(),
  restoreAccountAction: vi.fn(),
}));
import { AccountList } from "./account-list";

describe("AccountList", () => {
  it("describes a negative balance with text", () => {
    render(
      <AccountList
        rows={[
          {
            id: "11111111-1111-4111-8111-111111111111",
            name: "Kas",
            type: "cash",
            status: "active",
            systemKey: null,
            openingBalance: "0",
            balance: "-1000",
          },
        ]}
      />,
    );
    expect(screen.getByText("Account balance is negative.")).toBeInTheDocument();
    expect(screen.getByText("-Rp 1.000")).toBeInTheDocument();
  });
});
