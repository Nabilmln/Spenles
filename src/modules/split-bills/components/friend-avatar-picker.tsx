"use client";

import Image from "next/image";
import { defaultAvatarPaths } from "@/lib/avatars";

export function FriendAvatarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <fieldset className="grid min-w-0 gap-[.6rem] border-0 p-0">
      <legend className="mb-[.6rem] text-[.86rem] font-medium">Avatar</legend>
      <div className="grid grid-cols-5 gap-2">
        {defaultAvatarPaths.map((src, index) => {
          const choice = index + 1;
          return (
            <label key={src} className="min-w-0 cursor-pointer">
              <input
                type="radio"
                name="avatarIndex"
                value={choice}
                checked={value === choice}
                onChange={() => onChange(choice)}
                aria-label={`Avatar ${choice}`}
                className="peer sr-only"
              />
              <span className="block rounded-full p-[2px] ring-1 ring-border transition-[ring-color,box-shadow] peer-checked:ring-2 peer-checked:ring-primary-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-600">
                <Image
                  src={src}
                  alt=""
                  width={48}
                  height={48}
                  className="aspect-square w-full rounded-full object-cover"
                />
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
