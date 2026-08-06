"use client";

import Link from "next/link";
import {
  FileBarChart,
  LayoutDashboard,
  ListTree,
  Plus,
  ReceiptText,
  Repeat2,
  Target,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: ReceiptText },
  { href: "/accounts", label: "Akun", icon: WalletCards },
  { href: "/categories", label: "Kategori", icon: ListTree },
  { href: "/budgets", label: "Anggaran", icon: Target },
  { href: "/recurring-transactions", label: "Berulang", icon: Repeat2 },
  { href: "/split-bills", label: "Split Bill", icon: UsersRound },
  { href: "/reports", label: "Laporan", icon: FileBarChart },
  { href: "/settings/profile", label: "Profil", icon: UserRound },
];

const mobileLinks = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: ReceiptText },
  { href: "/split-bills", label: "Split Bill", icon: UsersRound },
  { href: "/reports", label: "Pelaporan", icon: FileBarChart },
];

export function NavigationLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <nav className="mobile-nav-links" aria-label="Navigasi utama">
        {mobileLinks.slice(0, 2).map(({ href, label, icon: Icon }) => (
          <MobileLink active={pathname === href} href={href} icon={Icon} key={href} label={label} />
        ))}
        <Link
          aria-label="Tambah transaksi"
          className="mobile-add-link"
          href="/transactions/new"
        >
          <Plus size={26} strokeWidth={2.75} aria-hidden="true" />
          <span className="sr-only">Tambah transaksi</span>
        </Link>
        {mobileLinks.slice(2).map(({ href, label, icon: Icon }) => (
          <MobileLink active={pathname === href} href={href} icon={Icon} key={href} label={label} />
        ))}
      </nav>
    );
  }

  return (
    <nav className="sidebar-nav" aria-label="Navigasi utama">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn("nav-link", active && "nav-link-active")}
            href={href}
            key={href}
          >
            <Icon aria-hidden="true" size={20} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function MobileLink({
  active,
  href,
  label,
  icon: Icon,
}: {
  active: boolean;
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn("nav-link", active && "nav-link-active")}
      href={href}
    >
      <Icon aria-hidden="true" size={20} />
      <span>{label}</span>
    </Link>
  );
}
