import Link from "next/link";
import { WalletCards } from "lucide-react";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Spenles">
      <span className="brand-mark" aria-hidden="true">
        <WalletCards size={22} />
      </span>
      <span>Spenles</span>
    </Link>
  );
}
