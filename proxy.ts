import { auth } from "@/lib/auth/server";

export default auth.middleware({ loginUrl: "/login" });

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/transactions/:path*",
    "/categories/:path*",
    "/accounts/:path*",
    "/transfers/:path*",
    "/budgets/:path*",
    "/recurring-transactions/:path*",
    "/split-bills/:path*",
    "/reports/:path*",
    "/api/reports/:path*",
    "/api/exports/:path*",
  ],
};
