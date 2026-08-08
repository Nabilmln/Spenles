import { Brand } from "@/components/layout/brand";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto grid min-h-screen max-w-[76rem] grid-cols-[minmax(16rem,_.9fr)_minmax(22rem,_1.1fr)] items-center gap-[clamp(2rem,7vw,7rem)] p-12 max-[860px]:grid-cols-1 max-[860px]:gap-8 max-[860px]:px-5 max-[860px]:py-8 max-[540px]:items-start max-[540px]:pt-5">
      <div className="self-center max-[860px]:text-center">
        <Brand />
        <p className="mx-auto mt-[1.4rem] max-w-[25rem] text-muted text-[clamp(1.1rem,2vw,1.45rem)] leading-[1.6] max-[540px]:hidden">
          Catat lebih tenang. Pahami keuangan lebih jelas.
        </p>
      </div>
      <section className="w-full max-w-[31rem] justify-self-end rounded-[1.5rem] border border-border bg-surface p-[clamp(1.6rem,4vw,2.5rem)] shadow-card max-[860px]:justify-self-center max-[540px]:rounded-[1.1rem] max-[540px]:p-[1.35rem]">
        {children}
      </section>
    </main>
  );
}
