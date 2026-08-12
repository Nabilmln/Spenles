import type { Profile } from "@/db/schema";
import { HeaderContent } from "./header-content";

export function AppHeader({ profile, email }: { profile: Profile; email: string }) {
  return (
    <header className="sticky top-0 z-10 flex min-h-[3.75rem] items-center gap-3 border-b border-border bg-surface/80 px-[clamp(.85rem,2.5vw,1.75rem)] py-[.55rem] backdrop-blur-xl max-[540px]:gap-[.5rem]">
      <HeaderContent profile={profile} email={email} />
    </header>
  );
}
