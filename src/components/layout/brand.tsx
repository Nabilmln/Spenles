import Link from "next/link";
import { WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      href="/"
      className="relative z-[1] inline-flex items-center gap-[.65rem] text-[.95rem] font-semibold tracking-[-.02em]"
      aria-label="Spenles"
    >
      <span
        className="grid size-[2.35rem] shrink-0 place-items-center rounded-[.7rem] bg-primary-600 text-white shadow-[0_4px_16px_rgb(240_90_36/40%)]"
        aria-hidden="true"
      >
        <WalletCards size={18} />
      </span>
      <span className={cn("whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200", collapsed && "")}>
        Spenles
      </span>
    </Link>
  );
}
