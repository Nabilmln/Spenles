import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { cookies } from "next/headers";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { ToastProvider } from "@/components/ui/toast";
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
    "A personal finance app for income, expenses, budgets, cash flow, reports, and split bills.",
  applicationName: "Spenles",
  appleWebApp: {
    capable: true,
    title: "Spenles",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
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
      <body className={poppins.variable}>
        <ToastProvider>{children}</ToastProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
