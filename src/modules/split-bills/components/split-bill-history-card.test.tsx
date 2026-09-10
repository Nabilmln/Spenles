import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SplitBillHistoryCard } from "./split-bill-history-card";

afterEach(cleanup);

const base = {
  merchantName: "Warung Bu Endah",
  billDate: "2026-01-15",
  status: "finalized" as const,
  finalAmount: "2160000",
  participantCount: 4,
};

describe("split-bill history card", () => {
  it("renders merchant, participants, amount and date", () => {
    render(<SplitBillHistoryCard row={{ id: "b1", ...base }} />);
    expect(screen.getByText("Warung Bu Endah")).toBeInTheDocument();
    expect(screen.getByText("4 participants")).toBeInTheDocument();
    expect(screen.getByText("Rp 2.160.000")).toBeInTheDocument();
    expect(screen.getByText("January 15, 2026")).toBeInTheDocument();
    expect(screen.getByText("Final")).toBeInTheDocument();
  });

  it("links drafts to the editor and non-drafts to the result page", () => {
    const { rerender } = render(
      <SplitBillHistoryCard row={{ id: "b1", ...base }} />,
    );
    expect(screen.getByRole("link", { name: /view results/i })).toHaveAttribute(
      "href",
      "/split-bills/b1",
    );
    rerender(
      <SplitBillHistoryCard
        row={{ id: "b2", ...base, status: "draft", finalAmount: null }}
      />,
    );
    expect(
      screen.getByRole("link", { name: /continue draft/i }),
    ).toHaveAttribute("href", "/split-bills/b2/edit");
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });
});