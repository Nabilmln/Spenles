import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { ToastProvider } from "@/components/ui/toast";
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "@fontsource/poppins/latin-600.css";
import "@fontsource/poppins/latin-700.css";
import "@fontsource/poppins/latin-800.css";
import "./globals.css";

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

export async function generateViewport(): Promise<Viewport> {
  const cookieStore = await cookies();
  const theme = cookieStore.get("spenles-theme")?.value;
  if (theme === "light") return { themeColor: "#f5f5f7" };
  if (theme === "dark") return { themeColor: "#08080a" };
  return {
    themeColor: [
      { media: "(prefers-color-scheme: dark)", color: "#08080a" },
      { color: "#f5f5f7" },
    ],
  };
}

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
      <body>
        <ToastProvider>{children}</ToastProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
