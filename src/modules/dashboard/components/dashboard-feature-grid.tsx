import Link from "next/link";
import { ListTree, Repeat2, Target, WalletCards } from "lucide-react";

const features = [
  { href: "/budgets", label: "Anggaran", icon: Target },
  { href: "/recurring-transactions", label: "Transaksi berulang", icon: Repeat2 },
  { href: "/accounts", label: "Akun", icon: WalletCards },
  { href: "/categories", label: "Kategori", icon: ListTree },
];

export function DashboardFeatureGrid() {
  return (
    <section aria-labelledby="feature-grid-title" className="feature-grid card">
      <div className="dashboard-section-heading">
        <div>
          <p className="eyebrow">Fitur</p>
          <h2 id="feature-grid-title">Kelola keuangan Anda</h2>
        </div>
      </div>
      <div className="feature-grid-links">
        {features.map(({ href, label, icon: Icon }) => (
          <Link className="feature-link" href={href} key={href}>
            <Icon aria-hidden="true" size={22} />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
