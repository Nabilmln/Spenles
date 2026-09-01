"use client";

import { usePathname } from "next/navigation";
import type { Profile } from "@/db/schema";
import { BackButton } from "./back-button";
import { ProfileMenu } from "./profile-menu";
import { Brand } from "./brand";
import { ThemeToggle } from "@/components/theme/theme-toggle";

type HeaderMeta = {
  title?: string;
  back?: string;
  noBack?: boolean;
};

function resolveMeta(pathname: string): HeaderMeta {
  const path = pathname.replace(/\/$/, "") || "/";
  if (path === "/" || path === "/dashboard") return { title: "Home", noBack: true };

  if (path === "/transactions/new") return { title: "Add transaction", back: "/transactions" };
  if (/^\/transactions\/.+\/edit$/.test(path)) return { title: "Edit transaction", back: "/transactions" };
  if (path === "/transactions") return { title: "Transactions", back: "/dashboard" };

  if (path === "/accounts/new") return { title: "Add account", back: "/accounts" };
  if (/^\/accounts\/.+\/edit$/.test(path)) return { title: "Edit account", back: "/accounts" };
  if (/^\/accounts\/.+$/.test(path)) return { title: "Account details", back: "/accounts" };
  if (path === "/accounts") return { title: "Accounts", back: "/dashboard" };

  if (path === "/budgets/new") return { title: "Create budget", back: "/budgets" };
  if (/^\/budgets\/.+\/edit$/.test(path)) return { title: "Edit budget", back: "/budgets" };
  if (path === "/budgets") return { title: "Budgets", back: "/dashboard" };

  if (path === "/categories") return { title: "Categories", back: "/dashboard" };

  if (path === "/recurring-transactions/new") return { title: "Add recurring transaction", back: "/recurring-transactions" };
  if (/^\/recurring-transactions\/.+\/edit$/.test(path)) return { title: "Edit recurring transaction", back: "/recurring-transactions" };
  if (path === "/recurring-transactions") return { title: "Recurring Transactions", back: "/dashboard" };

  if (path === "/split-bills/new") return { title: "Create split bill", back: "/split-bills" };
  if (/^\/split-bills\/.+\/edit$/.test(path)) return { title: "Edit split bill", back: "/split-bills" };
  if (/^\/split-bills\/.+$/.test(path)) return { title: "Split bill details", back: "/split-bills" };
  if (path === "/split-bills") return { title: "Split Bill", back: "/dashboard" };

  if (/^\/reports\/categories\/.+$/.test(path)) return { title: "Category details", back: "/reports" };
  if (path === "/reports") return { title: "Reports", back: "/dashboard" };

  if (path === "/transfers") return { title: "Transfer", back: "/accounts" };
  if (path === "/settings/profile") return { title: "Profile", back: "/dashboard" };
  return {};
}

export function HeaderContent({
  profile,
  email,
}: {
  profile: Profile;
  email: string;
}) {
  const pathname = usePathname();
  const meta = resolveMeta(pathname);
  const showBack = !meta.noBack && meta.back !== undefined;

  return (
    <>
      {showBack ? (
        <BackButton fallback={meta.back} />
      ) : (
        <div className="hidden max-[860px]:block max-[860px]:flex-1 max-[860px]:[&_a>:last-child]:hidden"><Brand /></div>
      )}
      {showBack && meta.title ? (
        <h1 className="m-0 min-w-0 truncate text-[1.05rem] font-medium max-[540px]:text-[.95rem]">{meta.title}</h1>
      ) : null}
      <div className="flex-1" />
      <ThemeToggle currentTheme={profile.theme} />
      <ProfileMenu
        displayName={profile.displayName}
        email={email}
      />
    </>
  );
}