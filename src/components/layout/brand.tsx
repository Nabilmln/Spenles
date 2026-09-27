import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Brand({
  showLabel = false,
  tone = "default",
}: {
  showLabel?: boolean;
  tone?: "default" | "light" | "ink";
}) {
  return (
    <Link
      href="/"
      className="relative z-[1] inline-flex items-center gap-[.65rem] text-[.95rem] font-semibold tracking-[-.02em]"
      aria-label="Spenles"
    >
      <Image
        src="/brand-mark.svg"
        alt=""
        aria-hidden="true"
        width={38}
        height={38}
        className={cn(
          "size-[2.35rem] shrink-0",
          tone === "default" && "spenles-brand-auto",
          tone === "light" && "brightness-0 invert",
        )}
      />
      <span
        className={cn(
          "whitespace-nowrap transition-opacity duration-200",
          showLabel
            ? "opacity-100"
            : "opacity-0 group-hover/sidebar:opacity-100",
          tone === "light" ? "text-white" : undefined,
        )}
      >
        Spenles
      </span>
    </Link>
  );
}
