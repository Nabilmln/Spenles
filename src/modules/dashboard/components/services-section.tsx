"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { AddTransactionSheet } from "@/modules/transactions/components/add-transaction-sheet";
import { ProfileSheet } from "@/components/layout/profile-sheet";
import { SERVICES_SHEET_ITEMS } from "./services";
import { DashboardFeatureGrid } from "./dashboard-feature-grid";
import type { Profile } from "@/db/schema";

export function ServicesSection({
  profile,
  email,
}: {
  profile: Profile;
  email: string;
}) {
  const [open, setOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  function handleItem(id: string) {
    if (id === "add-expense") {
      setOpen(false);
      setAddExpenseOpen(true);
      return;
    }
    if (id === "profile") {
      setOpen(false);
      setProfileOpen(true);
    }
  }

  return (
    <section aria-label="Services">
      <div className="mb-[.55rem] flex items-center justify-between gap-3">
        <h3 className="m-0 text-[.72rem] font-semibold uppercase tracking-[.12em] text-muted">
          Services
        </h3>
        <button
          type="button"
          className="inline-flex items-center gap-[.2rem] whitespace-nowrap text-[.78rem] font-medium text-primary-600 hover:text-primary-700"
          onClick={() => setOpen(true)}
        >
          More Services
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>

      <DashboardFeatureGrid />

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Services"
        ariaLabel="Services"
      >
        <div className="grid max-h-[62vh] grid-cols-2 gap-[.7rem] overflow-y-auto pr-1 mb-5">
          {SERVICES_SHEET_ITEMS.map((item) => {
            const Icon = item.icon;
            if (item.kind === "sheet") {
              return (
                <button
                  className="flex min-h-[3.6rem] items-center gap-[.65rem] rounded-[1rem] border border-border bg-surface p-[.6rem_.75rem] text-left text-[.82rem] font-medium text-foreground transition-[background] duration-150 hover:bg-surface-subtle [&_svg]:shrink-0 [&_svg]:text-primary-600"
                  key={item.id}
                  type="button"
                  onClick={() => handleItem(item.id)}
                >
                  <Icon aria-hidden="true" size={18} />
                  <span className="min-w-0 truncate">{item.label}</span>
                </button>
              );
            }
            return (
              <Link
                className="flex min-h-[3.6rem] items-center gap-[.65rem] rounded-[1rem] border border-border bg-surface p-[.6rem_.75rem] text-left text-[.82rem] font-medium text-foreground transition-[background] duration-150 hover:bg-surface-subtle [&_svg]:shrink-0 [&_svg]:text-primary-600"
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                <Icon aria-hidden="true" size={18} />
                <span className="min-w-0 truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </BottomSheet>

      <AddTransactionSheet
        open={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
      />
      <ProfileSheet
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={profile}
        email={email}
      />
    </section>
  );
}
