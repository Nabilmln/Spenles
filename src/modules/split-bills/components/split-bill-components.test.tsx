import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SplitBillCalculationResult } from "../types/split-bill";
import { deleteSplitBillAction } from "../actions/split-bill-actions";
import { CalculationSummary } from "./calculation-summary";
import { SplitBillDetail, type SplitBillDetailData } from "./split-bill-detail";
import { SplitBillList } from "./split-bill-list";

vi.mock("../actions/split-bill-actions", () => ({
  archiveSplitBillAction: vi.fn(async () => ({})),
  deleteSplitBillAction: vi.fn(async () => ({})),
  updateParticipantPaymentAction: vi.fn(async () => ({})),
  createShareSummaryAction: vi.fn(async () => ({})),
}));

afterEach(cleanup);

const result: SplitBillCalculationResult = {
  calculationVersion: 1,
  subtotalAmount: 20_000n,
  discountAmount: 2_000n,
  discountedSubtotalAmount: 18_000n,
  itemTaxAmount: 900n,
  billTaxAmount: 900n,
  totalTaxAmount: 1_800n,
  serviceChargeAmount: 1_800n,
  finalAmount: 21_600n,
  items: [],
  assignments: [],
  participants: [
    {
      participantId: "a",
      name: "Ayu",
      position: 1,
      itemAmount: 9_000n,
      itemTaxAmount: 900n,
      billTaxAmount: 0n,
      serviceChargeAmount: 900n,
      finalAmount: 10_800n,
    },
    {
      participantId: "b",
      name: "Bima",
      position: 2,
      itemAmount: 9_000n,
      itemTaxAmount: 0n,
      billTaxAmount: 900n,
      serviceChargeAmount: 900n,
      finalAmount: 10_800n,
    },
  ],
};

describe("split-bill components", () => {
  it("labels browser calculation as a non-authoritative preview", () => {
    render(<CalculationSummary result={result} />);
    expect(screen.getByText("Local preview")).toBeInTheDocument();
    expect(screen.getByText(/not the final value/i)).toBeInTheDocument();
    expect(screen.getByText(/21\.600/u)).toBeInTheDocument();
    expect(screen.getAllByText(/10\.800/u)).toHaveLength(2);
  });

  it("renders deterministic history status and private detail links", () => {
    render(
      <SplitBillList
        rows={[
          {
            id: "00000000-0000-4000-8000-000000000001",
            merchantName: "Warung",
            billDate: "2026-08-05",
            status: "finalized",
            finalAmount: "21600",
            participantCount: 2,
          },
        ]}
        total={1}
        totalPages={1}
        filters={{ q: "", page: 1, pageSize: 20, sort: "billDate", direction: "desc" }}
      />,
    );
    expect(screen.getByText("Final")).toBeInTheDocument();
    expect(screen.getByText("2 participants")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View results" })).toHaveAttribute(
      "href",
      "/split-bills/00000000-0000-4000-8000-000000000001",
    );
    expect(
      screen.getByRole("navigation", { name: "Split bill pagination" }),
    ).toBeInTheDocument();
  });

  it("shows a primary empty state when history is genuinely empty", () => {
    render(
      <SplitBillList
        rows={[]}
        total={0}
        totalPages={1}
        filters={{ q: "", page: 1, pageSize: 20, sort: "billDate", direction: "desc" }}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "No Split Bill history yet" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create Split Bill" })).toHaveAttribute(
      "href",
      "/split-bills/new",
    );
  });

  it("offers a reset action when a filter produced no rows", () => {
    render(
      <SplitBillList
        rows={[]}
        total={0}
        totalPages={1}
        filters={{ q: "Tidak Ada", page: 1, pageSize: 20, sort: "billDate", direction: "desc" }}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "No bills for these filters" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reset filters" })).toHaveAttribute(
      "href",
      "/split-bills",
    );
  });
});

const detailData: SplitBillDetailData = {
  id: "00000000-0000-4000-8000-000000000001",
  merchantName: "Warung",
  billDate: "2026-08-05",
  note: null,
  status: "finalized",
  calculationVersion: 1,
  subtotalAmount: "20000",
  discountAmount: "2000",
  itemTaxAmount: "900",
  billTaxAmount: "900",
  serviceChargeAmount: "1800",
  finalAmount: "21600",
  items: [],
  participants: [],
};

describe("split-bill detail deletion", () => {
  beforeEach(() => {
    vi.mocked(deleteSplitBillAction).mockClear();
  });

  it("requires a two-step confirmation before deleting a finalized bill", () => {
    render(<SplitBillDetail detail={detailData} />);

    expect(screen.getByRole("heading", { name: "Delete" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete permanently" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete bill" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/permanent/i);
    expect(
      screen.getByRole("button", { name: "Delete permanently" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      screen.queryByRole("button", { name: "Delete permanently" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete bill" })).toBeInTheDocument();
  });

  it("submits the owned bill id when deletion is confirmed", () => {
    render(<SplitBillDetail detail={detailData} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete bill" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete permanently" }));

    expect(deleteSplitBillAction).toHaveBeenCalledTimes(1);
    const formData = vi.mocked(deleteSplitBillAction).mock.calls[0][0];
    expect(formData.get("id")).toBe(detailData.id);
  });

  it("offers deletion for archived bills without the archive card", () => {
    render(<SplitBillDetail detail={{ ...detailData, status: "archived" }} />);

    expect(screen.queryByRole("button", { name: "Archive bill" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete bill" })).toBeInTheDocument();
  });
});

describe("split-bill history row deletion", () => {
  beforeEach(() => {
    vi.mocked(deleteSplitBillAction).mockClear();
  });

  const rows: {
    id: string;
    merchantName: string;
    billDate: string;
    status: "draft" | "finalized" | "archived";
    finalAmount: string;
    participantCount: number;
  }[] = [
    {
      id: "00000000-0000-4000-8000-000000000001",
      merchantName: "Warung",
      billDate: "2026-08-05",
      status: "finalized",
      finalAmount: "21600",
      participantCount: 2,
    },
  ];

  it("confirms before deleting a bill directly from history", () => {
    render(
      <SplitBillList
        rows={rows}
        total={1}
        totalPages={1}
        filters={{ q: "", page: 1, pageSize: 20, sort: "billDate", direction: "desc" }}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Delete permanently" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete Warung" }));
    expect(screen.getByText("Delete bill?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByText("Delete bill?")).not.toBeInTheDocument();
  });

  it("submits the owned bill id when deletion is confirmed from history", () => {
    render(
      <SplitBillList
        rows={rows}
        total={1}
        totalPages={1}
        filters={{ q: "", page: 1, pageSize: 20, sort: "billDate", direction: "desc" }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete Warung" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(deleteSplitBillAction).toHaveBeenCalledTimes(1);
    const formData = vi.mocked(deleteSplitBillAction).mock.calls[0][0];
    expect(formData.get("id")).toBe(rows[0].id);
  });
});
