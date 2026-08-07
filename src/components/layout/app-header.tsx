import type { Profile } from "@/db/schema";
import { HeaderContent } from "./header-content";

export function AppHeader({ profile, email }: { profile: Profile; email: string }) {
  return (
    <header className="app-header">
      <HeaderContent profile={profile} email={email} />
    </header>
  );
}