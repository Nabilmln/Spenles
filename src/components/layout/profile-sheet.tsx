"use client";

import { useFormStatus } from "react-dom";
import { LogOut } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ProfileForm } from "@/modules/profiles/components/profile-form";
import { logoutAction } from "@/modules/auth/actions/logout";
import type { Profile } from "@/db/schema";

function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className=" mb-5 flex w-full min-h-[2.9rem] items-center gap-[.6rem] rounded-[.7rem] border-0 bg-transparent px-[.7rem] py-[.55rem] text-left text-[.9rem] font-medium text-expense hover:bg-[color-mix(in_srgb,var(--expense)_8%,transparent)] hover:text-expense focus-visible:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-55"
      disabled={pending}
      type="submit"
    >
      <LogOut size={18} aria-hidden="true" />
      {pending ? "Logging out..." : "Log out"}
    </button>
  );
}

export function ProfileSheet({
  open,
  onClose,
  profile,
  email,
}: {
  open: boolean;
  onClose: () => void;
  profile: Profile;
  email: string;
}) {
  const initial = profile.displayName.slice(0, 1).toUpperCase();

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Profile"
      ariaLabel="Profile"
    >
      <div className="mb-[1.1rem] grid place-items-center gap-[.6rem]">
        <span
          aria-hidden="true"
          className="grid size-[4.5rem] place-items-center rounded-full bg-primary-600 text-[1.5rem] font-semibold text-white shadow-[0_4px_16px_rgb(79_70_229/35%)]"
        >
          {initial}
        </span>
        <div className="grid text-center">
          <strong className="text-[1.05rem]">{profile.displayName}</strong>
          <small className="text-[.8rem] text-muted">{email}</small>
        </div>
      </div>

      <div className="px-[.25rem] pb-[.5rem]">
        <h4 className="m-[0_0_.2rem] text-[.72rem] font-semibold uppercase tracking-[.12em] text-muted">
          Edit profile
        </h4>
        <ProfileForm profile={profile} email={email} />
      </div>

      <div className="mb-[.75rem] mt-[1rem] border-t border-border" role="separator" />
      <form action={logoutAction}>
        <LogoutButton />
      </form>
    </BottomSheet>
  );
}
