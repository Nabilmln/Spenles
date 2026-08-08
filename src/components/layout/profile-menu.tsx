"use client";

import { useRef, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { LogOut, User } from "lucide-react";
import { logoutAction } from "@/modules/auth/actions/logout";

function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="profile-menu-logout flex w-full min-h-[2.7rem] items-center gap-[.6rem] rounded-[.65rem] border-0 bg-transparent px-[.7rem] py-[.55rem] text-left text-[.88rem] font-medium text-expense hover:bg-[color-mix(in_srgb,var(--expense)_8%,transparent)] hover:text-expense focus-visible:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-55"
      disabled={pending}
    >
      <LogOut size={17} aria-hidden="true" />
      {pending ? "Keluar..." : "Keluar"}
    </button>
  );
}

export function ProfileMenu({
  displayName,
  email,
}: {
  displayName: string;
  email: string;
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
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu profil"
      >
        <span className="grid size-[2.35rem] place-items-center rounded-full bg-primary-600 font-medium text-white" aria-hidden="true">{initial}</span>
        <span className="profile-trigger-copy">
          <strong>{displayName}</strong>
          <small>{email}</small>
        </span>
      </button>
      {open ? (
        <div className="absolute right-0 top-[calc(100%+.5rem)] z-40 w-56 rounded-[.9rem] border border-border bg-surface p-2 shadow-card" role="menu">
          <div className="grid gap-[.05rem] border-b border-border px-[.7rem] pb-[.75rem] pt-[.5rem]">
            <strong className="text-[.9rem]">{displayName}</strong>
            <small className="truncate text-muted text-[.76rem]">{email}</small>
          </div>
          <a className="flex w-full min-h-[2.7rem] items-center gap-[.6rem] rounded-[.65rem] border-0 bg-transparent px-[.7rem] py-[.55rem] text-left text-[.88rem] font-medium text-foreground hover:bg-surface-subtle focus-visible:bg-surface-subtle" role="menuitem" href="/settings/profile" onClick={() => setOpen(false)}>
            <User size={17} aria-hidden="true" />
            Profil
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
