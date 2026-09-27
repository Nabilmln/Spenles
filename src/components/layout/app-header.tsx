import type { Profile } from "@/db/schema";
import { HeaderContent } from "./header-content";

export function AppHeader({ profile, email }: { profile: Profile; email: string }) {
  return (
    <header className="sticky top-0 z-30 flex min-h-[3.75rem] items-center gap-3 px-[clamp(.85rem,2.5vw,1.75rem)] py-[.55rem] max-[540px]:gap-[.5rem]">
      <HeaderContent profile={profile} email={email} />
    </header>
  );
}
