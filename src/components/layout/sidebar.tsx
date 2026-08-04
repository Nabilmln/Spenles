import { Brand } from "./brand";
import { NavigationLinks } from "./navigation-links";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <Brand />
      <NavigationLinks />
      <p className="sidebar-phase">Transaksi inti · Fase 02</p>
    </aside>
  );
}
