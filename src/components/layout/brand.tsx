import Link from "next/link";
import { WalletCards } from "lucide-react";

export function Brand() {
  return (
    <Link
      href="/"
      className="brand inline-flex items-center gap-[.7rem] text-xl font-medium tracking-[-.03em]"
      aria-label="Spenles"
    >
      <span
        className="brand-mark grid size-10 place-items-center rounded-[.8rem] bg-primary-600 text-white shadow-[0_8px_20px_rgb(37_99_235/22%)]"
        aria-hidden="true"
      >
        <WalletCards size={22} />
      </span>
      <span>Spenles</span>
    </Link>
  );
}
