import Link from "next/link";
import { WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      href="/"
      className="relative z-[1] inline-flex items-center gap-[.7rem] text-xl font-medium tracking-[-.03em]"
      aria-label="Spenles"
    >
      <span
        className="grid size-10 shrink-0 place-items-center rounded-[.8rem] bg-primary-600 text-white shadow-[0_8px_20px_rgb(37_99_235/22%)]"
        aria-hidden="true"
      >
        <WalletCards size={22} />
      </span>
      <span className={cn("whitespace-nowrap", collapsed && "hidden group-hover/sidebar:inline")}>Spenles</span>
    </Link>
  );
}
