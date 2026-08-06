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
    <nav aria-label="Navigasi fitur" className="feature-nav-card card">
      <div className="feature-nav">
        {features.map(({ href, label, icon: Icon }) => (
          <Link className="feature-nav-item" href={href} key={href}>
            <Icon aria-hidden="true" size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
