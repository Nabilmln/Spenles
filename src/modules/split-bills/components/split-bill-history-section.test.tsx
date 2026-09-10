import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FriendRow } from "@/modules/friends/queries/friends";
import type { SplitBillFilters } from "../schemas/split-bill-filters";
import { SplitBillHistorySection } from "./split-bill-history-section";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("../actions/split-bill-actions", () => ({
  loadMoreSplitBillsAction: vi.fn(async () => ({ rows: [], hasMore: false })),
  deleteSplitBillByIdAction: vi.fn(async () => ({ ok: true })),
}));

vi.mock("./split-bill-filter-bar", () => ({
  SplitBillFilterBar: () => <form role="search">Filter stub</form>,
}));

vi.mock("./split-bill-friend-add-sheet", () => ({
  SplitBillFriendAddSheet: () => null,
}));

vi.mock("./split-bill-friend-edit-sheet", () => ({
  SplitBillFriendEditSheet: () => null,
}));

function createMockIntersectionObserver() {
  class MockIntersectionObserver {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds = [];
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);
  }
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

beforeEach(() => {
  pushMock.mockReset();
  createMockIntersectionObserver();
});

const filters: SplitBillFilters = {
  q: "",
  status: undefined,
  month: undefined,
  sort: "billDate",
  direction: "desc",
  page: 1,
  pageSize: 15,
};

const friends: FriendRow[] = [
  { id: "f1", name: "Ayu", createdAt: "2026-01-01T00:00:00.000Z" },
];

const rows = [
  {
    id: "b1",
    merchantName: "Warung Bu Endah",
    billDate: "2026-01-15",
    status: "finalized" as const,
    finalAmount: "2160000",
    participantCount: 3,
    participantNames: ["Ayu", "Bima", "Caca"],
  },
];

describe("split-bill history section", () => {
  it("renders friends, actions and the initial bill list", () => {
    render(
      <SplitBillHistorySection
        filters={filters}
        friends={friends}
        initialRows={rows}
        total={1}
      />,
    );
    expect(screen.getByRole("link", { name: /make bills/i })).toHaveAttribute(
      "href",
      "/split-bills/new",
    );
    expect(screen.getByRole("button", { name: /add friend/i })).toBeInTheDocument();
    expect(screen.getByText("Ayu")).toBeInTheDocument();
    expect(screen.getByText("Split Bill History")).toBeInTheDocument();
    expect(screen.getByText("Warung Bu Endah")).toBeInTheDocument();
  });

  it("shows an empty state when there are no bills", () => {
    render(
      <SplitBillHistorySection
        filters={filters}
        friends={[]}
        initialRows={[]}
        total={0}
      />,
    );
    expect(screen.getByText("No split bills yet")).toBeInTheDocument();
  });

  it("shows a filter-scoped empty state when a search keyword is set", () => {
    render(
      <SplitBillHistorySection
        filters={{ ...filters, q: "Soto" }}
        friends={[]}
        initialRows={[]}
        total={0}
      />,
    );
    expect(screen.getByText("No bills for these filters")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /reset filters/i })).toHaveAttribute(
      "href",
      "/split-bills",
    );
  });

  it("reports when there are no more bills to load", () => {
    render(
      <SplitBillHistorySection
        filters={filters}
        friends={friends}
        initialRows={rows}
        total={1}
      />,
    );
    expect(screen.getByText("No more split bills")).toBeInTheDocument();
  });

  it("opens the action sheet and navigates to the result page", async () => {
    render(
      <SplitBillHistorySection
        filters={filters}
        friends={friends}
        initialRows={rows}
        total={1}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Split bill actions" }),
    );
    const viewResult = await screen.findByRole("button", {
      name: "View Result",
    });
    fireEvent.click(viewResult);
    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/split-bills/b1"),
    );
  });

  it("opens the action sheet and deletes the bill after confirmation", async () => {
    const deleteAction = vi.mocked(
      (await import("../actions/split-bill-actions"))
        .deleteSplitBillByIdAction,
    );
    deleteAction.mockResolvedValue({ ok: true });
    render(
      <SplitBillHistorySection
        filters={filters}
        friends={friends}
        initialRows={rows}
        total={1}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Split bill actions" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Delete Split Bill" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Delete" }),
    );
    await waitFor(() => expect(deleteAction).toHaveBeenCalledWith("b1"));
    expect(await screen.findByText("No split bills yet")).toBeInTheDocument();
  });
});