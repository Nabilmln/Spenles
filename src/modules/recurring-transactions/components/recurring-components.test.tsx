import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../actions/recurring-actions", () => ({
  archiveRecurringRuleAction: vi.fn(),
  pauseRecurringRuleAction: vi.fn(),
  resumeRecurringRuleAction: vi.fn(),
}));
import { RecurringRuleList } from "./recurring-rule-list";

describe("RecurringRuleList", () => {
  it("shows a blocked relationship with explicit text", () => {
    render(
      <RecurringRuleList
        rows={[
          {
            id: "11111111-1111-4111-8111-111111111111",
            type: "expense",
            amount: "1000",
            accountId: "22222222-2222-4222-8222-222222222222",
            accountName: "Kas",
            categoryId: "33333333-3333-4333-8333-333333333333",
            categoryName: "Makanan",
            frequency: "monthly",
            startAt: new Date("2026-08-01T02:00:00Z"),
            endDate: null,
            nextOccurrenceAt: new Date("2026-09-01T02:00:00Z"),
            status: "paused",
            pauseReason: "blocked_account",
            note: null,
            lastFailureCode: "blocked_account",
          },
        ]}
      />,
    );
    expect(screen.getByText("Account inactive")).toBeInTheDocument();
    expect(screen.getByText("Paused")).toBeInTheDocument();
  });
});
