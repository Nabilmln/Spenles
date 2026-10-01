import type { Profile } from "@/db/schema";
import { AppHeader } from "./app-header";
import { MobileNavigation } from "./mobile-navigation";

export function AppShell({ profile, email, children }: { profile: Profile; email: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-[6.25rem]">
      <a
        className="absolute -left-[9999px] z-[100] inline-flex min-h-[2.5rem] items-center rounded-full bg-primary-600 px-[1rem] py-[.55rem] text-[.88rem] font-medium text-white focus:left-[.75rem] focus:top-[.75rem]"
        href="#main-content"
      >
        Skip to main content
      </a>
      <div className="min-w-0">
        <AppHeader profile={profile} email={email} />
        <main
          className="mx-auto w-full p-[clamp(1rem,3vw,2.25rem)]"
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}
