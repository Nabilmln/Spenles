import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createShareSummaryAction,
  type SplitBillActionState,
} from "../actions/split-bill-actions";
import { ShareSummaryButton } from "./share-summary-button";

vi.mock("../actions/split-bill-actions", () => ({
  createShareSummaryAction: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makeState(text?: string): SplitBillActionState {
  return text ? { success: "Ringkasan siap disalin.", text } : {};
}

describe("ShareSummaryButton clipboard", () => {
  it("copies the generated summary and reports success", async () => {
    const action = vi
      .mocked(createShareSummaryAction)
      .mockResolvedValue(makeState("Split Bill — Warung\nTotal: Rp21.600"));
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    render(<ShareSummaryButton billId="bill-1" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "Split Bill — Warung\nTotal: Rp21.600",
      ),
    );
    await screen.findByText("Ringkasan disalin ke clipboard.");
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("falls back to execCommand when the clipboard API is unavailable", async () => {
    vi.mocked(createShareSummaryAction).mockResolvedValue(
      makeState("Split Bill — Warung"),
    );
    Object.assign(navigator, { clipboard: undefined });
    const exec = vi.fn(() => true);
    Object.assign(document, { execCommand: exec });

    render(<ShareSummaryButton billId="bill-1" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await screen.findByText("Ringkasan disalin ke clipboard.");
    expect(exec).toHaveBeenCalledWith("copy");
  });

  it("reports a clear failure when copying cannot be performed", async () => {
    vi.mocked(createShareSummaryAction).mockResolvedValue(
      makeState("Split Bill — Warung"),
    );
    Object.assign(navigator, { clipboard: undefined });
    const exec = vi.fn(() => false);
    Object.assign(document, { execCommand: exec });

    render(<ShareSummaryButton billId="bill-1" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await screen.findByRole("alert");
    expect(screen.getByRole("alert")).toHaveTextContent(/gagal menyalin/i);
  });
});