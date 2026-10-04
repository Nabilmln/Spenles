import type { Profile } from "@/db/schema";
import { AppHeader } from "./app-header";
import { MobileNavigation } from "./mobile-navigation";

export function AppShell({ profile, email, children }: { profile: Profile; email: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-[6.25rem]">
      <div className="min-w-0">
        <AppHeader profile={profile} email={email} />
        <main className="mx-auto w-full p-[clamp(1rem,3vw,2.25rem)]">
          {children}
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}
