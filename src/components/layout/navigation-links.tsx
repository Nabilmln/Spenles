"use client";

import Link from "next/link";
import { Home, ReceiptText, WalletCards } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AddTransactionButton } from "./add-transaction-button";

const links = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/accounts", label: "Accounts", icon: WalletCards },
  { href: "/transactions", label: "Transactions", icon: ReceiptText },
];

export function NavigationLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex min-h-[2.9rem] min-w-[2.9rem] items-center justify-center gap-[.35rem] rounded-full px-2.5 text-muted transition-[background,color,box-shadow,width] duration-200",
              active && "bg-primary-50 font-medium text-primary-700",
            )}
            href={href}
            key={href}
          >
            <Icon aria-hidden="true" size={20} className="shrink-0" />
            <span className={cn(
              "overflow-hidden whitespace-nowrap text-[.72rem] transition-[max-width,opacity] duration-200",
              active ? "max-w-[5.5rem] opacity-100" : "max-w-0 opacity-0",
            )}>{label}</span>
          </Link>
        );
      })}
      <AddTransactionButton />
    </>
  );
}
