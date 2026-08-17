import { NavigationLinks } from "./navigation-links";

export function MobileNavigation() {
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-3 bottom-[max(1.1rem,env(safe-area-inset-bottom))] z-20 hidden grid-cols-5 gap-[.3rem] rounded-[1.15rem] border border-border bg-surface px-3 pb-[max(.35rem,env(safe-area-inset-bottom))] pt-[.35rem] shadow-card max-[860px]:grid"
    >
      <NavigationLinks mobile />
    </nav>
  );
}
