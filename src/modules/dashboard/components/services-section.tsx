"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ALL_SERVICES } from "./services";
import { DashboardFeatureGrid } from "./dashboard-feature-grid";

export function ServicesSection() {
  const [open, setOpen] = useState(false);

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
        <div className="grid max-h-[62vh] grid-cols-2 gap-[.7rem] overflow-y-auto pr-1">
          {ALL_SERVICES.map(({ href, label, icon: Icon }) => (
            <Link
              className="flex min-h-[3.6rem] items-center gap-[.65rem] rounded-[1rem] border border-border bg-surface p-[.6rem_.75rem] text-left text-[.82rem] font-medium text-foreground transition-[background] duration-150 hover:bg-surface-subtle [&_svg]:shrink-0 [&_svg]:text-primary-600"
              href={href}
              key={href}
              onClick={() => setOpen(false)}
            >
              <Icon aria-hidden="true" size={18} />
              <span className="min-w-0 truncate">{label}</span>
            </Link>
          ))}
        </div>
      </BottomSheet>
    </section>
  );
}