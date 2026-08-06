"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  ListTree,
  FileBarChart,
  ReceiptText,
  Repeat2,
  Target,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MobileMoreMenu } from "./mobile-more-menu";

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

const mobileLinks = links.slice(0, 3);

export function NavigationLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return (
    <nav className={mobile ? "mobile-nav-links" : "sidebar-nav"} aria-label="Navigasi utama">
      {(mobile ? mobileLinks : links).map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link key={href} href={href} className={cn("nav-link", active && "nav-link-active")} aria-current={active ? "page" : undefined}>
            <Icon size={20} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
      {mobile ? <MobileMoreMenu /> : null}
    </nav>
  );
}
