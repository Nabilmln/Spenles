import { MobileHomeRedirect } from "@/components/landing/mobile-home-redirect";
import { getSessionUser } from "@/lib/auth/require-session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getSessionUser();
  return <MobileHomeRedirect destination={user ? "/dashboard" : "/login"} />;
}
