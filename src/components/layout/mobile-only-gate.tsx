import { Smartphone } from "lucide-react";
import { Brand } from "./brand";

export function MobileOnlyGate() {
  return (
    <div className="hidden min-h-screen min-[861px]:flex items-center justify-center bg-[var(--backdrop)] px-6 py-10">
      <div className="w-full max-w-[26rem]">
        <div className="mb-8 flex justify-center">
          <Brand showLabel />
        </div>
        <div className="rounded-[1.25rem] border border-border bg-surface p-[clamp(1.4rem,3vw,1.75rem)] text-center shadow-card">
          <div className="mx-auto grid size-[3.5rem] place-items-center rounded-full bg-primary-50 text-primary-600">
            <Smartphone size={22} aria-hidden="true" />
          </div>
          <h1 className="m-[1.1rem_0_.4rem]! text-[1.05rem]! font-medium!">
            Spenles hanya untuk perangkat mobile
          </h1>
          <p className="m-0 text-[.85rem] leading-[1.55] text-muted">
            Buka Spenles lewat ponselmu untuk mengelola keuangan. Spenles dirancang sebagai aplikasi mobile.
          </p>
        </div>
      </div>
    </div>
  );
}