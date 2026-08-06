import { Brand } from "./brand";
import { NavigationLinks } from "./navigation-links";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <Brand />
      <NavigationLinks />
      <p className="sidebar-phase">Keuangan pribadi</p>
    </aside>
  );
}
