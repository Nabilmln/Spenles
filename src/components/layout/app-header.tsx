import { LogOut } from "lucide-react";
import type { Profile } from "@/db/schema";
import { logoutAction } from "@/modules/auth/actions/logout";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Brand } from "./brand";

export function AppHeader({ profile, email }: { profile: Profile; email: string }) {
  return (
    <header className="app-header">
      <div className="mobile-brand"><Brand /></div>
      <div className="header-spacer" />
      <ThemeSwitcher currentTheme={profile.theme} />
      <div className="user-summary">
        <span className="user-avatar" aria-hidden="true">{profile.displayName.slice(0, 1).toUpperCase()}</span>
        <span className="user-copy"><strong>{profile.displayName}</strong><small>{email}</small></span>
      </div>
      <form action={logoutAction}>
        <button className="icon-button" type="submit" aria-label="Keluar"><LogOut size={19} aria-hidden="true" /></button>
      </form>
    </header>
  );
}
