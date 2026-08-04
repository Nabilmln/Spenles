import { auth } from "@/lib/auth/server";

export const { GET, POST } = auth.handler();
export const dynamic = "force-dynamic";
