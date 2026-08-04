import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}