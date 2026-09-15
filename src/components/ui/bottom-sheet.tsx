"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const EXIT_MS = 240;

let scrollLockCount = 0;
let lockedScrollY = 0;

function lockBodyScroll() {
  scrollLockCount += 1;
  if (scrollLockCount === 1) {
    lockedScrollY = window.scrollY;
    const body = document.body.style;
    body.position = "fixed";
    body.top = `${-lockedScrollY}px`;
    body.left = "0";
    body.right = "0";
    body.overflowY = "scroll";
    document.documentElement.style.overflow = "hidden";
  }
}

function unlockBodyScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount !== 0) return;
  const body = document.body.style;
  body.position = "";
  body.top = "";
  body.left = "";
  body.right = "";
  body.overflowY = "";
  document.documentElement.style.overflow = "";
  try {
    window.scrollTo({ top: lockedScrollY });
  } catch {
    // Some environments (e.g. jsdom) do not implement window.scrollTo.
  }
}

export function BottomSheet({
  open,
  onClose,
  title,
  ariaLabel,
  zIndex = "z-[80]",
  fullHeight = false,
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  ariaLabel: string;
  zIndex?: string;
  fullHeight?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [prevOpen, setPrevOpen] = useState(open);
  const [closing, setClosing] = useState(false);

  const visible = open || closing;

  if (prevOpen !== open) {
    setPrevOpen(open);
    setClosing(!open);
  }

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => setClosing(false), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [closing]);

  useEffect(() => {
    if (!visible || closing) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [visible, closing, onClose]);

  useEffect(() => {
    if (!visible) return;
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [visible]);
  if (!visible) return null;

  return createPortal(
    <div
      className={cn("fixed inset-0 z-[80] flex items-end", zIndex)}
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
          "relative flex w-full flex-col overflow-hidden rounded-t-[1.6rem] border-t border-border bg-surface shadow-[0_-10px_40px_rgb(15_15_18/20%)]",
          fullHeight ? "h-dvh" : "max-h-[88dvh]",
          closing ? "profile-curtain-out" : "profile-curtain-in",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-[1.1rem] flex shrink-0 items-center justify-between p-5 pb-0">
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
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto",
            footer
              ? "p-5 pb-5"
              : "p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]",
          )}
        >
          {children}
        </div>
        {footer ? (
          <div className="shrink-0 border-t border-border p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}