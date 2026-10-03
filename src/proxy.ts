import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";

const protectPage = auth.middleware({ loginUrl: "/login" });

export default function proxy(request: NextRequest) {
  // Neon Auth 0.4.2-beta forwards POST to its GET-only session endpoint.
  // Server Actions keep their own session checks and must bypass this proxy.
  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }
  return protectPage(request);
}

export const config = {
  matcher: [
    {
      source: "/(dashboard|transactions|accounts|budgets|categories|reports|split-bills|transfers)/:path*",
      missing: [{ type: "header", key: "next-action" }],
    },
  ],
};
