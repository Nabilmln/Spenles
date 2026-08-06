import type { Profile } from "@/db/schema";
import { AppHeader } from "./app-header";
import { MobileNavigation } from "./mobile-navigation";
import { Sidebar } from "./sidebar";

export function AppShell({ profile, email, children }: { profile: Profile; email: string; children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Lewati ke konten utama
      </a>
      <Sidebar />
      <div className="app-main">
        <AppHeader profile={profile} email={email} />
        <main className="page-container" id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}
