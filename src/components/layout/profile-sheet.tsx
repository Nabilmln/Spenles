"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Check, LogOut, Pencil } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ProfileForm } from "@/modules/profiles/components/profile-form";
import { updateProfileAvatarAction } from "@/modules/profiles/actions/update-profile";
import { logoutAction } from "@/modules/auth/actions/logout";
import { avatarPath, defaultAvatarPaths } from "@/lib/avatars";
import type { Profile } from "@/db/schema";

function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#d8dbdd] bg-white px-4 text-sm font-semibold text-[#171717] transition-colors hover:bg-[#f2f3f4] active:bg-[#e9ebed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717] disabled:opacity-55"
      disabled={pending}
      type="submit"
    >
      <LogOut size={18} aria-hidden="true" />
      {pending ? "Logging out..." : "Log out"}
    </button>
  );
}

export function ProfileSheet({
  open, onClose, profile, email, avatarIndex, onAvatarChange,
}: {
  open: boolean;
  onClose: () => void;
  profile: Profile;
  email: string;
  avatarIndex: number;
  onAvatarChange: (index: number) => void;
}) {
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(avatarIndex);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  function saveAvatar() {
    startTransition(async () => {
      try {
        const result = await updateProfileAvatarAction(selectedIndex);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        onAvatarChange(selectedIndex);
        router.refresh();
        setAvatarOpen(false);
        toast.success(result.success ?? "Profile photo updated.");
      } catch {
        toast.error("Could not update your profile photo. Try again.");
      }
    });
  }

  return (
    <>
      <BottomSheet open={open && !avatarOpen} onClose={onClose} title="Profile" ariaLabel="Profile">
        <div className="mb-7 flex flex-col items-center text-center">
          <button
            type="button"
            className="relative mb-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#171717]"
            aria-label="Change profile photo"
            onClick={() => { setSelectedIndex(avatarIndex); setAvatarOpen(true); }}
          >
            <Image src={avatarPath(avatarIndex)} alt="" width={80} height={80} className="size-20 rounded-full object-cover ring-1 ring-[#d8dbdd]" />
            <span className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full border-[3px] border-white bg-[#171717] text-white">
              <Pencil size={13} aria-hidden="true" />
            </span>
          </button>
          <p className="m-0 text-[.9rem] text-[#62666a]">{email}</p>
        </div>

        <ProfileForm profile={profile} onSuccess={onClose} />
        <div className="my-6 border-t border-[#e4e6e8]" role="separator" />
        <form action={logoutAction}><LogoutButton /></form>
      </BottomSheet>

      <BottomSheet open={avatarOpen} onClose={() => setAvatarOpen(false)} title="Profile photo" ariaLabel="Choose profile photo" zIndex="z-[90]">
        <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Profile photos">
          {defaultAvatarPaths.map((path, index) => {
            const value = index + 1;
            const selected = selectedIndex === value;
            return (
              <label
                key={path}
                className={`relative cursor-pointer rounded-[1.25rem] border-2 bg-[#f3f4f5] p-2 transition-[border-color,transform] active:scale-[.97] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#171717] ${selected ? "border-[#171717]" : "border-transparent"}`}
              >
                <input type="radio" name="profile-photo" value={value} checked={selected} onChange={() => setSelectedIndex(value)} aria-label={`Photo ${value}`} className="sr-only" />
                <Image src={path} alt="" width={100} height={100} className="aspect-square w-full rounded-[.85rem] object-cover" />
                {selected && <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-[#171717] text-white"><Check size={13} aria-hidden="true" /></span>}
              </label>
            );
          })}
        </div>
        <Button type="button" className="mt-6 w-full rounded-full" disabled={pending} onClick={saveAvatar}>
          {pending ? "Saving..." : "Save photo"}
        </Button>
      </BottomSheet>
    </>
  );
}
