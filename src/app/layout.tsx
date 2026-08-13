import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Spenles",
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
      <body className={poppins.variable}>{children}</body>
    </html>
  );
}
