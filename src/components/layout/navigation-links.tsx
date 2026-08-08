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

const linkBase =
  "flex min-h-[2.9rem] items-center gap-[.8rem] rounded-[.75rem] px-[.85rem] py-[.7rem] text-[.92rem] font-medium text-muted hover:bg-surface-subtle hover:text-foreground max-[860px]:min-h-[3.5rem] max-[860px]:flex-col max-[860px]:justify-center max-[860px]:gap-[.2rem] max-[860px]:rounded-[.8rem] max-[860px]:px-[.25rem] max-[860px]:py-[.35rem] max-[860px]:text-[.7rem]";

const linkActive =
  "text-primary-700 bg-primary-50 dark:text-[#93c5fd] dark:bg-[rgb(37_99_235/16%)]";

export function NavigationLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <>
        {mobileLinks.slice(0, 2).map(({ href, label, icon: Icon }) => (
          <MobileLink active={pathname === href} href={href} icon={Icon} key={href} label={label} />
        ))}
        <Link
          aria-label="Tambah transaksi"
          className="relative z-[1] grid min-h-[3.5rem] place-items-center before:absolute before:z-[-1] before:size-12 before:rounded-full before:bg-primary-600 before:shadow-[0_8px_18px_rgb(37_99_235/35%)] [&_svg]:text-white"
          href="/transactions/new"
        >
          <Plus size={26} strokeWidth={2.75} aria-hidden="true" />
          <span className="sr-only">Tambah transaksi</span>
        </Link>
        {mobileLinks.slice(2).map(({ href, label, icon: Icon }) => (
          <MobileLink active={pathname === href} href={href} icon={Icon} key={href} label={label} />
        ))}
      </>
    );
  }

  return (
    <nav className="mt-[2.6rem] grid gap-[.4rem]" aria-label="Navigasi utama">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(linkBase, active && linkActive)}
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
      className={cn(linkBase, active && linkActive)}
      href={href}
    >
      <Icon aria-hidden="true" size={20} />
      <span>{label}</span>
    </Link>
  );
}
