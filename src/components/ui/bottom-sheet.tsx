"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function BottomSheet({
  open,
  onClose,
  title,
  ariaLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        aria-label={`Close ${ariaLabel}`}
        className="absolute inset-0 cursor-default bg-[rgb(15_15_18/45%)]"
        onClick={onClose}
      />
      <div
        className="relative w-full rounded-t-[1.6rem] border-t border-border bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-10px_40px_rgb(15_15_18/20%)] profile-curtain-in"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-[1.1rem] flex items-center justify-between">
          <h2 className="m-0 text-[1.05rem] font-semibold tracking-[-.02em]">
            {title}
          </h2>
          <button
            type="button"
            className="grid size-[2.4rem] place-items-center rounded-full bg-surface-subtle text-foreground transition-colors hover:bg-surface-subtle"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}