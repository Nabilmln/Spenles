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
  "relative flex h-[2.6rem] items-center gap-[.75rem] rounded-[.65rem] px-[.6rem] text-[.85rem] font-medium text-muted transition-[background,color] duration-150 hover:bg-surface-subtle hover:text-foreground overflow-hidden max-[860px]:min-h-[3.5rem] max-[860px]:flex-col max-[860px]:justify-center max-[860px]:gap-[.2rem] max-[860px]:rounded-[.8rem] max-[860px]:px-[.25rem] max-[860px]:py-[.35rem] max-[860px]:text-[.68rem] max-[860px]:h-auto";

const linkActive =
  "text-primary-600 bg-primary-50 dark:text-primary-700 dark:bg-primary-50";

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
          className="relative z-[1] grid size-[3.1rem] place-items-center self-center rounded-full before:absolute before:z-[-1] before:inset-0 before:rounded-full before:bg-primary-600 before:shadow-[0_6px_20px_rgb(79_70_229/45%)] [&_svg]:text-white"
          href="/transactions/new"
        >
          <Plus size={22} strokeWidth={2.75} aria-hidden="true" />
          <span className="sr-only">Tambah transaksi</span>
        </Link>
        {mobileLinks.slice(2).map(({ href, label, icon: Icon }) => (
          <MobileLink active={pathname === href} href={href} icon={Icon} key={href} label={label} />
        ))}
      </>
    );
  }

  return (
    <nav className="mt-[1.75rem] grid gap-[.2rem]" aria-label="Navigasi utama">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(linkBase, active && linkActive)}
            href={href}
            key={href}
          >
            <Icon aria-hidden="true" size={17} className="shrink-0" />
            <span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150">{label}</span>
            {active && (
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-r-full bg-primary-600"
                aria-hidden="true"
              />
            )}
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
      className={cn(
        "relative flex min-h-[3.1rem] items-center justify-center gap-[.3rem] rounded-full px-1 text-muted transition-[background,color,box-shadow] duration-200",
        active &&
          "bg-primary-50 font-medium text-primary-700 dark:bg-primary-50 dark:text-primary-700",
      )}
      href={href}
    >
      <Icon aria-hidden="true" size={20} className="shrink-0" />
      <span
        className={cn(
          "overflow-hidden whitespace-nowrap text-[.72rem] transition-[max-width,opacity] duration-200",
          active ? "max-w-[5rem] opacity-100" : "max-w-0 opacity-0",
        )}
      >
        {label}
      </span>
    </Link>
  );
}
