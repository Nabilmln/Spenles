import Link from "next/link";
import { ListTree, Repeat2, Target, WalletCards } from "lucide-react";

const features = [
  { href: "/accounts", label: "Akun", icon: WalletCards },
  { href: "/budgets", label: "Anggaran", icon: Target },
  { href: "/categories", label: "Kategori", icon: ListTree },
  { href: "/recurring-transactions", label: "Berulang", icon: Repeat2 },
];

export function DashboardFeatureGrid() {
  return (
    <nav
      aria-label="Navigasi fitur"
      className="hidden max-[860px]:flex max-[860px]:gap-2"
    >
      {features.map(({ href, label, icon: Icon }) => (
        <Link
          className="flex min-h-[4.5rem] flex-1 flex-col items-center justify-center gap-[.35rem] rounded-[.8rem] border border-border bg-surface p-[.5rem_.4rem] text-center text-[.72rem] font-medium text-foreground shadow-card transition-[background] duration-150 hover:bg-surface-subtle [&_svg]:text-primary-600"
          href={href}
          key={href}
        >
          <Icon aria-hidden="true" size={20} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}