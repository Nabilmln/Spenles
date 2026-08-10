import type { Profile } from "@/db/schema";
import { AppHeader } from "./app-header";
import { MobileNavigation } from "./mobile-navigation";
import { Sidebar } from "./sidebar";

export function AppShell({ profile, email, children }: { profile: Profile; email: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-[auto_minmax(0,1fr)] max-[860px]:block max-[860px]:pb-[6.25rem]">
      <a
        className="absolute -left-[9999px] z-[100] inline-flex min-h-[2.75rem] items-center rounded-[.75rem] bg-primary-600 px-[1.1rem] py-[.65rem] font-medium text-white focus:left-[.75rem] focus:top-[.75rem]"
        href="#main-content"
      >
        Lewati ke konten utama
      </a>
      <Sidebar />
      <div className="min-w-0">
        <AppHeader profile={profile} email={email} />
        <main
          className="mx-auto w-full max-w-[82rem] p-[clamp(1.25rem,4vw,2.75rem)]"
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
