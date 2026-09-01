"use client";

import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useFormStatus } from "react-dom";
import { LogOut, User, X } from "lucide-react";
import { logoutAction } from "@/modules/auth/actions/logout";

function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="flex w-full min-h-[2.9rem] items-center gap-[.6rem] rounded-[.7rem] border-0 bg-transparent px-[.7rem] py-[.55rem] text-left text-[.9rem] font-medium text-expense hover:bg-[color-mix(in_srgb,var(--expense)_8%,transparent)] hover:text-expense focus-visible:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-55"
      disabled={pending}
    >
      <LogOut size={18} aria-hidden="true" />
      {pending ? "Logging out..." : "Log out"}
    </button>
  );
}

export function ProfileMenu({
  displayName,
  email,
  defaultCurrency,
  timezone,
}: {
  displayName: string;
  email: string;
  defaultCurrency: string;
  timezone: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="flex min-h-[2.75rem] items-center gap-[.65rem] rounded-full border-0 bg-transparent p-0 text-foreground"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open profile"
      >
        <span className="grid size-[2.3rem] place-items-center rounded-full bg-primary-600 font-medium text-white shadow-[0_2px_10px_rgb(79_70_229/35%)]" aria-hidden="true">{initial}</span>
        <span className="hidden min-[861px]:block">
          <strong className="block max-w-[10rem] truncate text-left text-[.85rem] leading-[1.2]">{displayName}</strong>
          <small className="block max-w-[10rem] truncate text-left text-[.7rem] text-muted">{email}</small>
        </span>
      </button>

      {/* Mobile curtain reveal (bottom sheet) — rendered via portal so it covers
          the whole viewport and sits above the bottom navigation. */}
      {open
        ? createPortal(
            <div className="fixed inset-0 z-[80] flex items-end" role="dialog" aria-modal="true" aria-label="Profile">
              <button
                type="button"
                aria-label="Close profile"
                className="absolute inset-0 cursor-default bg-[rgb(15_15_18/45%)]"
                onClick={() => setOpen(false)}
              />
              <div className="relative w-full rounded-t-[1.6rem] border-t border-border bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-10px_40px_rgb(15_15_18/20%)] profile-curtain-in">
                <div className="mb-[1.1rem] flex items-center justify-between">
                  <h2 className="m-0 text-[1.05rem] font-semibold tracking-[-.02em]">Profile</h2>
                  <button
                    type="button"
                    className="grid size-[2.4rem] place-items-center rounded-full bg-surface-subtle text-foreground transition-colors hover:bg-surface-subtle"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </div>
                <div className="mb-[1.1rem] grid place-items-center gap-[.6rem]">
                  <span className="grid size-[4.5rem] place-items-center rounded-full bg-primary-600 text-[1.5rem] font-semibold text-white shadow-[0_4px_16px_rgb(79_70_229/35%)]" aria-hidden="true">{initial}</span>
                  <div className="grid text-center">
                    <strong className="text-[1.05rem]">{displayName}</strong>
                    <small className="text-[.8rem] text-muted">{email}</small>
                  </div>
                </div>
                <dl className="m-0 grid gap-[.55rem]">
                  <div className="flex items-center justify-between gap-3 rounded-[.8rem] bg-surface-subtle px-[.8rem] py-[.65rem]">
                    <dt className="text-[.8rem] text-muted">Email</dt>
                    <dd className="m-0 min-w-0 truncate text-[.82rem] font-medium">{email}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-[.8rem] bg-surface-subtle px-[.8rem] py-[.65rem]">
                    <dt className="text-[.8rem] text-muted">Currency</dt>
                    <dd className="m-0 text-[.82rem] font-medium">{defaultCurrency}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-[.8rem] bg-surface-subtle px-[.8rem] py-[.65rem]">
                    <dt className="text-[.8rem] text-muted">Timezone</dt>
                    <dd className="m-0 min-w-0 truncate text-[.82rem] font-medium">{timezone}</dd>
                  </div>
                </dl>
                <a
                  className="mt-[1.1rem] flex min-h-[3rem] w-full items-center gap-[.6rem] rounded-[.7rem] border-0 bg-transparent px-[.7rem] py-[.55rem] text-left text-[.9rem] font-medium text-foreground hover:bg-surface-subtle focus-visible:bg-surface-subtle"
                  href="/settings/profile"
                  onClick={() => setOpen(false)}
                >
                  <User size={18} aria-hidden="true" />
                  Edit profile
                </a>
                <div className="my-[.5rem] border-t border-border" role="separator" />
                <form action={logoutAction}>
                  <LogoutButton />
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}

      {/* Desktop dropdown */}
      {open ? (
        <div className="absolute right-0 top-[calc(100%+.5rem)] z-40 hidden w-56 rounded-[.9rem] border border-border bg-surface p-2 shadow-card min-[861px]:block" role="menu">
          <div className="grid gap-[.05rem] border-b border-border px-[.7rem] pb-[.75rem] pt-[.5rem]">
            <strong className="text-[.9rem]">{displayName}</strong>
            <small className="truncate text-muted text-[.76rem]">{email}</small>
          </div>
          <a className="flex w-full min-h-[2.7rem] items-center gap-[.6rem] rounded-[.65rem] border-0 bg-transparent px-[.7rem] py-[.55rem] text-left text-[.88rem] font-medium text-foreground hover:bg-surface-subtle focus-visible:bg-surface-subtle" role="menuitem" href="/settings/profile" onClick={() => setOpen(false)}>
            <User size={17} aria-hidden="true" />
            Profile
          </a>
          <div className="my-[.35rem] border-t border-border" role="separator" />
          <form action={logoutAction}>
            <LogoutButton />
          </form>
        </div>
      ) : null}
    </div>
  );
}