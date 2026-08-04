"use client";

import Link from "next/link";
import { LayoutDashboard, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/settings/profile", label: "Profil", icon: UserRound },
];

export function NavigationLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return (
    <nav className={mobile ? "mobile-nav-links" : "sidebar-nav"} aria-label="Navigasi utama">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} className={cn("nav-link", active && "nav-link-active")} aria-current={active ? "page" : undefined}>
            <Icon size={20} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
