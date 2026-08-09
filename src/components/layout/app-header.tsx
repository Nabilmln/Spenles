import type { Profile } from "@/db/schema";
import { HeaderContent } from "./header-content";

export function AppHeader({ profile, email }: { profile: Profile; email: string }) {
  return (
    <header className="sticky top-0 z-10 flex min-h-[4.5rem] items-center gap-4 border-b border-border bg-surface/90 px-[clamp(1rem,3vw,2.25rem)] py-[.75rem] backdrop-blur-md max-[540px]:gap-[.55rem]">
      <HeaderContent profile={profile} email={email} />
    </header>
  );
}
