import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SplitBillHistoryCard } from "./split-bill-history-card";

afterEach(cleanup);

const base = {
  merchantName: "Warung Bu Endah",
  billDate: "2026-01-15",
  status: "finalized" as const,
  finalAmount: "2160000",
  participantCount: 4,
  participantNames: ["Ayu", "Bima", "Caca", "Deni"],
};

describe("split-bill history card", () => {
  it("renders merchant, badge, amount, date and participant stack", () => {
    render(
      <SplitBillHistoryCard row={{ id: "b1", ...base }} onAction={vi.fn()} />,
    );
    expect(screen.getByText("Warung Bu Endah")).toBeInTheDocument();
    expect(screen.getByText("Rp 2.160.000")).toBeInTheDocument();
    expect(screen.getByText("January 15, 2026")).toBeInTheDocument();
    expect(screen.getByText("Final")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "4 participants" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/^[ABC]$/).length).toBe(3);
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("shows the Draft badge and hides the amount for draft bills", () => {
    render(
      <SplitBillHistoryCard
        row={{ id: "b2", ...base, status: "draft", finalAmount: null, participantNames: ["Ayu"] }}
        onAction={vi.fn()}
      />,
    );
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.queryByText(/^Rp /)).not.toBeInTheDocument();
  });

  it("does not render navigation links anymore", () => {
    render(
      <SplitBillHistoryCard row={{ id: "b1", ...base }} onAction={vi.fn()} />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("invokes onAction with the row from the compact actions button", () => {
    const onAction = vi.fn();
    const row = { id: "b1", ...base };
    render(<SplitBillHistoryCard row={row} onAction={onAction} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Split bill actions" }),
    );
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith(row);
  });
});