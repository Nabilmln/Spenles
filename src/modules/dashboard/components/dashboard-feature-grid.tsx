import Link from "next/link";
import { QUICK_SERVICES } from "./services";

export function DashboardFeatureGrid() {
  return (
    <nav
      aria-label="Quick services"
      className="grid min-w-0 grid-cols-4 gap-2"
    >
      {QUICK_SERVICES.map(({ href, label, icon: Icon }) => (
        <Link
          className="grid min-h-[4.2rem] grid-cols-1 content-center items-center justify-items-center gap-[.4rem] rounded-[1rem] border border-border bg-surface p-[.55rem_.35rem] text-center text-[.72rem] font-medium text-foreground shadow-card transition-[transform,background] duration-150 active:scale-[.97] hover:bg-surface-subtle [&_svg]:text-primary-600"
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