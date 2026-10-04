"use client";

import Image from "next/image";
import { useState } from "react";
import type { Profile } from "@/db/schema";
import { avatarIndexForId, avatarPath } from "@/lib/avatars";
import { ProfileSheet } from "./profile-sheet";

export function ProfileMenu({
  profile,
  email,
}: {
  profile: Profile;
  email: string;
}) {
  const [open, setOpen] = useState(false);
  const [avatarOverride, setAvatarIndex] = useState<number | null>(null);
  const avatarIndex = avatarOverride ?? profile.avatarIndex ?? avatarIndexForId(profile.userId);
  const avatar = avatarPath(avatarIndex);

  return (
    <div className="relative z-40">
      <button
        type="button"
        className="grid size-11 place-items-center rounded-full border-0 bg-transparent p-0 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open profile"
      >
        <Image src={avatar} alt="" aria-hidden="true" width={40} height={40} className="size-10 rounded-full object-cover ring-1 ring-border" />
      </button>

      <ProfileSheet
        open={open}
        onClose={() => setOpen(false)}
        profile={profile}
        email={email}
        avatarIndex={avatarIndex}
        onAvatarChange={setAvatarIndex}
      />
    </div>
  );
}
