"use client";

import { useState } from "react";
import type { Profile } from "@/db/schema";
import { ProfileSheet } from "./profile-sheet";

export function ProfileMenu({
  profile,
  email,
}: {
  profile: Profile;
  email: string;
}) {
  const [open, setOpen] = useState(false);
  const initial = profile.displayName.slice(0, 1).toUpperCase();

  return (
    <div className="relative z-40">
      <button
        type="button"
        className="flex min-h-[2.75rem] items-center gap-[.65rem] rounded-full border-0 bg-transparent p-0 text-foreground"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open profile"
      >
        <span className="grid size-[2.3rem] place-items-center rounded-full bg-primary-600 text-[.9rem] font-medium text-white shadow-[0_2px_10px_rgb(79_70_229/35%)]" aria-hidden="true">{initial}</span>
        <span className="hidden min-[861px]:block">
          <strong className="block max-w-[10rem] truncate text-left text-[.85rem] leading-[1.2]">{profile.displayName}</strong>
          <small className="block max-w-[10rem] truncate text-left text-[.7rem] text-muted">{email}</small>
        </span>
      </button>

      <ProfileSheet
        open={open}
        onClose={() => setOpen(false)}
        profile={profile}
        email={email}
      />
    </div>
  );
}
