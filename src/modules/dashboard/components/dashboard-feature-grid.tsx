import Link from "next/link";
import { ListTree, Repeat2, Target, WalletCards } from "lucide-react";
import { cardClass } from "@/components/ui/styles";

const features = [
  { href: "/accounts", label: "Akun", icon: WalletCards },
  { href: "/budgets", label: "Anggaran", icon: Target },
  { href: "/categories", label: "Kategori", icon: ListTree },
  { href: "/recurring-transactions", label: "Berulang", icon: Repeat2 },
];

export function DashboardFeatureGrid() {
  return (
    <nav aria-label="Navigasi fitur" className={`${cardClass} shadow-none`}>
      <div className="flex gap-[.4rem] overflow-x-auto pb-[.15rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {features.map(({ href, label, icon: Icon }) => (
          <Link
            className="flex min-h-[3.5rem] min-w-[4.75rem] flex-1 flex-col items-center justify-center gap-[.35rem] rounded-[.8rem] p-[.5rem_.4rem] text-center text-[.72rem] font-medium text-foreground hover:bg-surface-subtle [&_svg]:text-primary-600"
            href={href}
            key={href}
          >
            <Icon aria-hidden="true" size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
