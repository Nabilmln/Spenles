"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
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

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[80] flex items-end"
              role="dialog"
              aria-modal="true"
              aria-label="Services"
            >
              <button
                type="button"
                aria-label="Close services"
                className="absolute inset-0 cursor-default bg-[rgb(15_15_18/45%)]"
                onClick={() => setOpen(false)}
              />
              <div className="relative w-full rounded-t-[1.6rem] border-t border-border bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-10px_40px_rgb(15_15_18/20%)] profile-curtain-in">
                <div className="mb-[1.1rem] flex items-center justify-between">
                  <h2 className="m-0 text-[1.05rem] font-semibold tracking-[-.02em]">Services</h2>
                  <button
                    type="button"
                    className="grid size-[2.4rem] place-items-center rounded-full bg-surface-subtle text-foreground transition-colors hover:bg-surface-subtle"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </div>
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
              </div>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}