"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const EXIT_MS = 240;

export function BottomSheet({
  open,
  onClose,
  title,
  ariaLabel,
  zIndex = "z-[80]",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  ariaLabel: string;
  zIndex?: string;
  children: React.ReactNode;
}) {
  const [prevOpen, setPrevOpen] = useState(open);
  const [closing, setClosing] = useState(false);

  if (prevOpen !== open) {
    setPrevOpen(open);
    setClosing(!open);
  }

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => setClosing(false), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [closing]);

  const visible = open || closing;
  if (!visible) return null;

  return createPortal(
    <div
      className={cn("fixed inset-0 flex items-end", zIndex)}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        aria-label={`Close ${ariaLabel}`}
        className={cn(
          "absolute inset-0 cursor-default bg-[rgb(15_15_18/45%)]",
          closing ? "curtain-backdrop-out" : "curtain-backdrop-in",
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full rounded-t-[1.6rem] border-t border-border bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-10px_40px_rgb(15_15_18/20%)]",
          closing ? "profile-curtain-out" : "profile-curtain-in",
        )}
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