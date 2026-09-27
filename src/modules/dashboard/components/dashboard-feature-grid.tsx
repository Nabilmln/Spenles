import Link from "next/link";
import { DASHBOARD_SERVICES } from "./services";

export function DashboardFeatureGrid() {
  return (
    <nav
      aria-label="Quick services"
      className="grid min-w-0 grid-cols-4 gap-2"
    >
      {DASHBOARD_SERVICES.map(({ href, label, icon: Icon }) => (
        <Link
          className="grid min-h-[4.6rem] grid-cols-1 content-center items-center justify-items-center gap-[.45rem] rounded-[.9rem] border border-border bg-surface p-[.6rem_.25rem] text-center text-[.73rem] font-medium leading-[1.2] text-foreground transition-[transform,background,border-color] duration-150 active:scale-[.97] hover:border-primary-300 hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 [&_svg]:text-primary-600"
          href={href}
          key={href}
        >
          <Icon aria-hidden="true" size={20} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
