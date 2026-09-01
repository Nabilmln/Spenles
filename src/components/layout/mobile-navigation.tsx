import { NavigationLinks } from "./navigation-links";

export function MobileNavigation() {
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-3 bottom-[max(.85rem,env(safe-area-inset-bottom))] z-20 hidden grid-cols-5 items-stretch gap-[.15rem] rounded-[1.4rem] border border-border bg-surface/90 px-[.55rem] py-[.45rem] shadow-[0_10px_40px_rgb(15_15_18/18%)] backdrop-blur-xl max-[860px]:grid"
    >
      <NavigationLinks mobile />
    </nav>
  );
}
