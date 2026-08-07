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
  if (path === "/" || path === "/dashboard") return { title: "Beranda", noBack: true };
  if (path === "/transactions/new") return { title: "Tambah transaksi", back: "/transactions" };
  if (path.endsWith("/edit")) return { title: "Edit transaksi", back: "/transactions" };
  if (path === "/transactions") return { title: "Transaksi", back: "/dashboard" };
  if (path === "/accounts/new") return { title: "Tambah akun", back: "/accounts" };
  if (/\/accounts\/.+\/edit/.test(path)) return { title: "Edit akun", back: "/accounts" };
  if (/\/accounts\/.+/.test(path)) return { title: "Detail akun", back: "/accounts" };
  if (path === "/accounts") return { title: "Akun", back: "/dashboard" };
  if (path === "/budgets/new") return { title: "Buat anggaran", back: "/budgets" };
  if (path.endsWith("/edit")) return { title: "Edit anggaran", back: "/budgets" };
  if (path === "/budgets") return { title: "Anggaran", back: "/dashboard" };
  if (path === "/categories") return { title: "Kategori", back: "/dashboard" };
  if (path === "/recurring-transactions/new") return { title: "Tambah transaksi berulang", back: "/recurring-transactions" };
  if (path.endsWith("/edit")) return { title: "Edit transaksi berulang", back: "/recurring-transactions" };
  if (path === "/recurring-transactions") return { title: "Transaksi Berulang", back: "/dashboard" };
  if (path === "/split-bills/new") return { title: "Buat split bill", back: "/split-bills" };
  if (path.endsWith("/edit")) return { title: "Edit split bill", back: "/split-bills" };
  if (/\/split-bills\/.+/.test(path)) return { title: "Detail split bill", back: "/split-bills" };
  if (path === "/split-bills") return { title: "Split Bill", back: "/dashboard" };
  if (/\/reports\/categories\/.+/.test(path)) return { title: "Detail kategori", back: "/reports" };
  if (path === "/reports") return { title: "Laporan", back: "/dashboard" };
  if (path === "/transfers") return { title: "Transfer", back: "/accounts" };
  if (path === "/settings/profile") return { title: "Profil", back: "/dashboard" };
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
        <div className="mobile-brand"><Brand /></div>
      )}
      {showBack && meta.title ? (
        <h1 className="app-header-title">{meta.title}</h1>
      ) : null}
      <div className="header-spacer" />
      <ThemeToggle currentTheme={profile.theme} />
      <ProfileMenu
        displayName={profile.displayName}
        email={email}
      />
    </>
  );
}