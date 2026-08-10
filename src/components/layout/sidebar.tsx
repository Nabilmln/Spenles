"use client";

import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Brand } from "./brand";
import { NavigationLinks } from "./navigation-links";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "group/sidebar sticky top-0 flex h-screen flex-col overflow-hidden border-r border-border bg-surface p-6 transition-[width] duration-200 max-[860px]:hidden",
        collapsed ? "w-[5.1rem] py-6 pr-[1.1rem] pl-[1.1rem] hover:w-[16.5rem] hover:pr-6 hover:pl-6" : "w-[16.5rem]",
      )}
    >
      <Brand collapsed={collapsed} />
      <NavigationLinks collapsed={collapsed} />
      <div className="mt-auto flex items-center justify-between gap-2">
        <p className={cn("m-0 text-sm text-muted", collapsed && "hidden group-hover/sidebar:block")}>
          Keuangan pribadi
        </p>
        <button
          aria-label={collapsed ? "Perluas menu" : "Ciutkan menu"}
          className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-[.7rem] border border-border bg-surface text-muted hover:bg-surface-subtle hover:text-foreground"
          onClick={() => setCollapsed((value) => !value)}
          type="button"
        >
          {collapsed ? <ChevronsRight size={18} aria-hidden="true" /> : <ChevronsLeft size={18} aria-hidden="true" />}
        </button>
      </div>
    </aside>
  );
}