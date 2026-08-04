import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Spenles",
    template: "%s | Spenles",
  },
  description:
    "Aplikasi pencatatan keuangan, anggaran, arus kas, laporan, dan split bill personal.",
  applicationName: "Spenles",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const storedTheme = cookieStore.get("spenles-theme")?.value;
  const theme =
    storedTheme === "light" || storedTheme === "dark" ? storedTheme : "system";

  return (
    <html lang="id" className={`theme-${theme}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
