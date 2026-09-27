import { NavigationLinks } from "./navigation-links";

export function MobileNavigation() {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-[max(1.25rem,calc(env(safe-area-inset-bottom)+.5rem))] left-1/2 z-20 flex w-fit -translate-x-1/2 items-center gap-[.2rem] rounded-full bg-primary-700 px-[.5rem] py-[.35rem] shadow-[0_10px_32px_rgb(15_15_18/22%)]"
    >
      <NavigationLinks />
    </nav>
  );
}
