"use client";

import { useRef, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { LogOut, User } from "lucide-react";
import { logoutAction } from "@/modules/auth/actions/logout";
import { cn } from "@/lib/utils";

function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="profile-menu-item profile-menu-logout" disabled={pending}>
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
    <div className="profile-menu" ref={rootRef}>
      <button
        type="button"
        className="profile-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu profil"
      >
        <span className="user-avatar" aria-hidden="true">{initial}</span>
        <span className="profile-trigger-copy">
          <strong>{displayName}</strong>
          <small>{email}</small>
        </span>
      </button>
      {open ? (
        <div className={cn("profile-sheet", open && "profile-sheet-open")} role="menu">
          <div className="profile-sheet-head">
            <strong>{displayName}</strong>
            <small>{email}</small>
          </div>
          <a className="profile-menu-item" role="menuitem" href="/settings/profile" onClick={() => setOpen(false)}>
            <User size={17} aria-hidden="true" />
            Profil
          </a>
          <div className="profile-sheet-divider" role="separator" />
          <form action={logoutAction}>
            <LogoutButton />
          </form>
        </div>
      ) : null}
    </div>
  );
}
