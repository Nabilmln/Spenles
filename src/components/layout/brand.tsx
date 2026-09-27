import Link from "next/link";
import Image from "next/image";

export function Brand({ showLabel = true }: { showLabel?: boolean }) {
  return (
    <Link
      href="/"
      className="relative z-[1] inline-flex min-h-11 items-center gap-[.65rem] text-[.95rem] font-semibold tracking-[-.02em]"
      aria-label="Spenles"
    >
      <Image src="/brand-mark.svg" alt="" aria-hidden="true" width={38} height={38} className="size-[2.35rem] shrink-0" />
      {showLabel && <span className="whitespace-nowrap">Spenles</span>}
    </Link>
  );
}
