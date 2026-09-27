import { Brand } from "@/components/layout/brand";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-start justify-center px-5 py-10">
      <div className="w-full max-w-[26rem]">
        <div className="mb-7"><Brand showLabel /></div>
        <div className="rounded-[1.25rem] border border-border bg-surface p-[clamp(1.4rem,3vw,2rem)] shadow-card">
          {children}
        </div>
      </div>
    </main>
  );
}
