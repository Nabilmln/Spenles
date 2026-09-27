import type { Metadata, Viewport } from "next";
import { DesktopLanding } from "@/components/landing/desktop-landing";
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
    icon: [
      { url: "/brand-mark.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = { themeColor: "#f5f5f7" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <div className="min-[861px]:hidden">{children}</div>
          <div className="hidden min-[861px]:block"><DesktopLanding /></div>
        </ToastProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
