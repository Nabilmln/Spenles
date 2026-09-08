"use client";

import { cn } from "@/lib/utils";
import type { Profile } from "@/db/schema";
import { Brand } from "./brand";
import { NavigationLinks } from "./navigation-links";

export function Sidebar({
  profile,
  email,
}: {
  profile: Profile;
  email: string;
}) {
  return (
    <aside
      className={cn(
        "group/sidebar sticky top-0 flex h-screen flex-col overflow-hidden border-r border-border bg-surface transition-[width] duration-200 ease-in-out max-[860px]:hidden",
        "w-[4.2rem] hover:w-[15rem]",
      )}
    >
      <div className="flex flex-col h-full p-[.75rem] pt-[1.1rem] overflow-hidden">
        <Brand />
        <NavigationLinks profile={profile} email={email} />
        <div className="mt-auto pt-[.75rem] border-t border-border">
          <p className="m-0 text-[.72rem] text-muted opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap px-[.5rem] pb-[.25rem]">
            Personal finance
          </p>
        </div>
      </div>
    </aside>
  );
}