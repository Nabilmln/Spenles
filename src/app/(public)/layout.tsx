import { CircleCheck } from "lucide-react";
import { Brand } from "@/components/layout/brand";

const highlights = [
  "Track income and expenses easily",
  "Monthly budgets and automatic reports",
  "Your financial data stays secure",
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen min-[861px]:grid-cols-[minmax(18rem,_1fr)_minmax(22rem,_1.05fr)]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-primary-600 to-primary-700 min-[861px]:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -right-20 size-96 rounded-full bg-white/10"
        />
        <div className="relative z-[1] flex w-full flex-col justify-between gap-12 p-12 xl:p-16">
          <Brand showLabel tone="light" />
          <div className="grid gap-5">
            <h1 className="m-0 max-w-[26rem] text-[clamp(1.9rem,3vw,2.7rem)] leading-[1.12] tracking-[-.03em] text-white">
              Track calmly. Understand your finances more clearly.
            </h1>
            <ul className="m-0 grid gap-3 p-0">
              {highlights.map((item) => (
                <li
                  className="flex items-center gap-2.5 text-[.92rem] text-white/90"
                  key={item}
                >
                  <CircleCheck aria-hidden="true" size={17} className="shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="flex items-start justify-center px-5 py-10 min-[861px]:items-center min-[861px]:px-10">
        <div className="w-full max-w-[26rem]">
          <div className="mb-7 min-[861px]:hidden">
            <Brand showLabel />
          </div>
          <div className="rounded-[1.25rem] border border-border bg-surface p-[clamp(1.4rem,3vw,2rem)] shadow-card">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}