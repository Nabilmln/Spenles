import type { Profile } from "@/db/schema";
import { AppHeader } from "./app-header";
import { MobileNavigation } from "./mobile-navigation";
import { Sidebar } from "./sidebar";

export function AppShell({ profile, email, children }: { profile: Profile; email: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-[auto_minmax(0,1fr)] max-[860px]:block max-[860px]:pb-[6.25rem]">
      <a
        className="absolute -left-[9999px] z-[100] inline-flex min-h-[2.5rem] items-center rounded-[.65rem] bg-primary-600 px-[1rem] py-[.55rem] text-[.88rem] font-medium text-white focus:left-[.75rem] focus:top-[.75rem]"
        href="#main-content"
      >
        Lewati ke konten utama
      </a>
      <Sidebar />
      <div className="min-w-0">
        <AppHeader profile={profile} email={email} />
        <main
          className="mx-auto w-full max-w-[82rem] p-[clamp(1rem,3vw,2.25rem)]"
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
