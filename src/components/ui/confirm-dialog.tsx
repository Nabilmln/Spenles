"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const EXIT_MS = 200;

export function ConfirmDialog({
  open,
  onClose,
  title,
  message,
  confirmLabel = "Delete",
  pending = false,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
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
      className="fixed inset-0 z-[90] grid place-items-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Close dialog"
        className={cn(
          "absolute inset-0 cursor-default bg-[rgb(15_15_18/55%)]",
          closing ? "curtain-backdrop-out" : "curtain-backdrop-in",
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-[min(24rem,100%)] rounded-[1.1rem] border border-border bg-surface p-[1.15rem] shadow-card",
          closing ? "dialog-out" : "dialog-in",
        )}
      >
        <div className="grid place-items-center gap-[1rem] text-center">
          <span className="grid size-[3rem] place-items-center rounded-full bg-[color-mix(in_srgb,var(--expense)_10%,transparent)] text-expense">
            <TriangleAlert size={22} aria-hidden="true" />
          </span>
          <div>
            <h2 className="m-0 text-[1rem]">{title}</h2>
            <p className="mt-[.35rem] mb-0 text-[.85rem] text-muted">{message}</p>
          </div>
        </div>
        <div className="mt-[1.15rem] grid grid-cols-2 gap-[.6rem]">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="danger" disabled={pending} onClick={onConfirm}>
            {pending ? "Deleting..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}