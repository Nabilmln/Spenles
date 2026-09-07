"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTransition } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { reverseTransferByIdAction } from "@/modules/accounts/actions/transfer-actions";
import { TransactionCard, type TransactionCardRow } from "@/components/transactions/transaction-card";
import {
  deleteTransactionHistoryByIdAction,
  loadMoreTransactionHistoryAction,
} from "../actions/transaction-actions";
import type { TransactionFilters } from "../schemas/transaction-filters";
import { EditTransactionSheet } from "./edit-transaction-sheet";
import { TransactionFilterBar } from "./transaction-filters";
import { TransactionActionSheet } from "./transaction-action-sheet";

const INITIAL_PAGE = 1;

function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-[.75rem]">
      {Array.from({ length: count }, (_, index) => (
        <div
          aria-hidden="true"
          className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[.8rem] rounded-[1.1rem] border border-border bg-surface p-[.85rem]"
          key={index}
        >
          <span className="size-[2.7rem] animate-pulse rounded-full bg-surface-subtle" />
          <div className="grid gap-[.35rem]">
            <span className="h-[.8rem] w-2/3 animate-pulse rounded-[.3rem] bg-surface-subtle" />
            <span className="h-[.7rem] w-1/3 animate-pulse rounded-[.3rem] bg-surface-subtle" />
          </div>
          <span className="h-[.8rem] w-16 animate-pulse rounded-[.3rem] bg-surface-subtle" />
        </div>
      ))}
    </div>
  );
}

export function TransactionHistorySection({
  filters,
  accounts,
  categories,
  initialRows,
  total,
}: {
  filters: TransactionFilters;
  accounts: { id: string; name: string }[];
  categories: {
    id: string;
    name: string;
    type: "income" | "expense";
    icon: string | null;
    color: string | null;
  }[];
  initialRows: TransactionCardRow[];
  total: number;
}) {
  const toast = useToast();
  const [rows, setRows] = useState(initialRows);
  const [page, setPage] = useState(INITIAL_PAGE);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialRows.length < total);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const [prevInitial, setPrevInitial] = useState(initialRows);
  const [prevTotal, setPrevTotal] = useState(total);
  if (prevInitial !== initialRows || prevTotal !== total) {
    setPrevInitial(initialRows);
    setPrevTotal(total);
    setRows(initialRows);
    setPage(INITIAL_PAGE);
    setHasMore(initialRows.length < total);
  }

  const [selected, setSelected] = useState<{ id: string; type: TransactionCardRow["type"] } | null>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const resetFromPageOne = useCallback(() => {
    loadMoreTransactionHistoryAction(filters, INITIAL_PAGE).then((result) => {
      setRows(result.rows);
      setPage(INITIAL_PAGE);
      setHasMore(result.hasMore);
    });
  }, [filters]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || loadingRef.current || !hasMore) return;
        loadingRef.current = true;
        setLoading(true);
        const nextPage = page + 1;
        loadMoreTransactionHistoryAction(filters, nextPage)
          .then((result) => {
            setRows((current) => [...current, ...result.rows]);
            setPage(nextPage);
            setHasMore(result.hasMore);
          })
          .finally(() => {
            loadingRef.current = false;
            setLoading(false);
          });
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, page, filters]);

  const hasResults = rows.length > 0;

  function handleAction(id: string, type: TransactionCardRow["type"]) {
    setSelected({ id, type });
    setActionSheetOpen(true);
  }

  function handleEdit() {
    setActionSheetOpen(false);
    setEditOpen(true);
  }

  function handleDelete() {
    setActionSheetOpen(false);
    setDeleteOpen(true);
  }

  function confirmDelete() {
    if (!selected) return;
    startTransition(async () => {
      const ok =
        selected.type === "transfer"
          ? (await reverseTransferByIdAction(selected.id)).ok
          : (await deleteTransactionHistoryByIdAction(selected.id)).ok;
      if (ok) {
        toast.success("Transaction deleted successfully.");
        setDeleteOpen(false);
        setSelected(null);
        resetFromPageOne();
      } else {
        toast.error("Transaction could not be deleted.");
      }
    });
  }

  return (
    <section aria-label="Transaction history">
      <div className="mb-[.8rem] flex items-baseline justify-between gap-3">
        <h2 className="m-0 text-[.95rem] tracking-[-.02em]">
          Transaction History
        </h2>
      </div>

      <div className="mb-[.9rem]">
        <TransactionFilterBar
          filters={filters}
          accounts={accounts}
          categories={categories}
        />
      </div>

      {hasResults ? (
        <div className="grid gap-[.75rem]">
          {rows.map((row) => (
            <TransactionCard
              key={row.id}
              transaction={row}
              showActions
              onAction={handleAction}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={filters.q || filters.type || (filters.category?.length ?? 0) > 0 || filters.account ? "No transactions found" : "No transactions yet"}
          description={
            filters.q || filters.type || (filters.category?.length ?? 0) > 0 || filters.account
              ? "Try another search keyword or change your filter."
              : "Start adding your first transaction to see your financial activity here."
          }
        />
      )}

      {loading ? <SkeletonCards /> : null}

      {hasMore ? (
        <div ref={sentinelRef} aria-hidden="true" className="h-1" />
      ) : hasResults ? (
        <p className="m-0 pt-[1rem] text-center text-[.76rem] text-muted">
          No more transactions
        </p>
      ) : null}

      <TransactionActionSheet
        open={actionSheetOpen}
        onClose={() => setActionSheetOpen(false)}
        canEdit={selected?.type !== "transfer"}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <EditTransactionSheet
        transactionId={selected?.type === "transfer" ? null : selected?.id ?? null}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={resetFromPageOne}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Transaction?"
        message={
          selected?.type === "transfer"
            ? "Are you sure you want to delete this transfer? It will be reversed and removed from your history."
            : "Are you sure you want to delete this transaction? This cannot be undone."
        }
        confirmLabel="Delete"
        pending={isPending}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
