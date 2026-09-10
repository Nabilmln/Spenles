"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { buttonClass } from "@/components/ui/styles";
import { loadMoreSplitBillsAction } from "../actions/split-bill-actions";
import type { SplitBillFilters } from "../schemas/split-bill-filters";
import type { FriendRow } from "@/modules/friends/queries/friends";
import { FriendCarousel } from "./friend-carousel";
import { SplitBillFriendAddSheet } from "./split-bill-friend-add-sheet";
import { SplitBillFilterBar } from "./split-bill-filter-bar";
import { SplitBillHistoryCard } from "./split-bill-history-card";

const INITIAL_PAGE = 1;

type SplitBillHistoryRow = {
  id: string;
  merchantName: string;
  billDate: string;
  status: "draft" | "finalized" | "archived";
  finalAmount: string | null;
  participantCount: number;
};

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

export function SplitBillHistorySection({
  filters,
  initialRows,
  total,
  friends,
}: {
  filters: SplitBillFilters;
  initialRows: SplitBillHistoryRow[];
  total: number;
  friends: FriendRow[];
}) {
  const [rows, setRows] = useState(initialRows);
  const [page, setPage] = useState(INITIAL_PAGE);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialRows.length < total);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const [addFriendOpen, setAddFriendOpen] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || loadingRef.current || !hasMore) return;
        loadingRef.current = true;
        setLoading(true);
        const nextPage = page + 1;
        loadMoreSplitBillsAction(filters, nextPage)
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
  const hasActiveFilters = Boolean(
    filters.q || (filters.status && filters.status !== "all") || filters.month,
  );

  return (
    <section aria-label="Split bill history">
      {/* Friends section */}
      <div className="mb-[1rem]">
        <h3 className="m-0 mb-[.55rem] text-[.72rem] font-semibold uppercase tracking-[.12em] text-muted">
          Friends
        </h3>
        <FriendCarousel
          friends={friends}
          onAddFriend={() => setAddFriendOpen(true)}
        />
      </div>

      {/* Action buttons */}
      <div className="mb-[1.2rem] flex gap-[.55rem]">
        <Link
          className={buttonClass("primary", "flex-1 justify-center")}
          href="/split-bills/new"
        >
          Make Bills
        </Link>
        <button
          className={buttonClass("secondary", "flex-1 justify-center")}
          onClick={() => setAddFriendOpen(true)}
          type="button"
        >
          + Add Friend
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-[1rem]">
        <SplitBillFilterBar filters={filters} />
      </div>

      {/* History heading */}
      <div className="mb-[.8rem] flex items-baseline justify-between gap-3">
        <h2 className="m-0 text-[.95rem] tracking-[-.02em]">
          Split Bill History
        </h2>
      </div>

      {/* Bill list */}
      {hasResults ? (
        <div className="grid gap-[.75rem]">
          {rows.map((row) => (
            <SplitBillHistoryCard key={row.id} row={row} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<span aria-hidden="true" className="text-[1.5rem]">💵</span>}
          title={
            hasActiveFilters
              ? "No bills for these filters"
              : "No split bills yet"
          }
          description={
            hasActiveFilters
              ? "Try changing the keyword or filters used."
              : "Create your first Split Bill with Make Bills above."
          }
          action={
            hasActiveFilters ? (
              <Link
                className={buttonClass("secondary", "w-full justify-center")}
                href="/split-bills"
              >
                Reset filters
              </Link>
            ) : undefined
          }
        />
      )}

      {loading ? <SkeletonCards /> : null}

      {hasMore ? (
        <div ref={sentinelRef} aria-hidden="true" className="h-1" />
      ) : hasResults ? (
        <p className="m-0 pt-[1rem] text-center text-[.76rem] text-muted">
          No more split bills
        </p>
      ) : null}

      {/* Add Friend Sheet */}
      <SplitBillFriendAddSheet
        open={addFriendOpen}
        onClose={() => setAddFriendOpen(false)}
      />
    </section>
  );
}
