import { Brand } from "./brand";
import { NavigationLinks } from "./navigation-links";

export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen flex-col border-r border-border bg-surface p-6 max-[860px]:hidden">
      <Brand />
      <NavigationLinks />
      <p className="mt-auto mb-0 text-muted text-xs">Keuangan pribadi</p>
    </aside>
  );
}
