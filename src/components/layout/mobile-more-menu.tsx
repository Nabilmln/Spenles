"use client";

import Link from "next/link";
import {
  ListTree,
  MoreHorizontal,
  Repeat2,
  Target,
  UserRound,
  UsersRound,
} from "lucide-react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/categories", label: "Kategori", icon: ListTree },
  { href: "/budgets", label: "Anggaran", icon: Target },
  { href: "/recurring-transactions", label: "Berulang", icon: Repeat2 },
  { href: "/split-bills", label: "Split Bill", icon: UsersRound },
  { href: "/settings/profile", label: "Profil", icon: UserRound },
];

export function MobileMoreMenu() {
  const pathname = usePathname();
  const active = links.some(
    (link) => pathname === link.href || pathname.startsWith(`${link.href}/`),
  );
  return (
    <details className="mobile-more">
      <summary className={active ? "nav-link nav-link-active" : "nav-link"}>
        <MoreHorizontal size={20} aria-hidden="true" />
        <span>Lainnya</span>
      </summary>
      <div className="mobile-more-popover">
        {links.map(({ href, label, icon: Icon }) => (
          <Link href={href} key={href}>
            <Icon size={19} aria-hidden="true" />
            {label}
          </Link>
        ))}
      </div>
    </details>
  );
}
