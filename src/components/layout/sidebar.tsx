import { Brand } from "./brand";
import { NavigationLinks } from "./navigation-links";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <Brand />
      <NavigationLinks />
      <p className="sidebar-phase">Fondasi aplikasi · Fase 01</p>
    </aside>
  );
}
