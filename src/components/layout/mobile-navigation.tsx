import { NavigationLinks } from "./navigation-links";

export function MobileNavigation() {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-[max(1.25rem,calc(env(safe-area-inset-bottom)+.5rem))] left-1/2 z-20 hidden w-fit -translate-x-1/2 grid-cols-4 items-stretch gap-[.2rem] rounded-[1.5rem] border border-border bg-surface/90 px-[.55rem] py-[.45rem] shadow-[0_10px_40px_rgb(15_15_18/18%)] backdrop-blur-xl max-[860px]:grid"
    >
      <NavigationLinks mobile />
    </nav>
  );
}
