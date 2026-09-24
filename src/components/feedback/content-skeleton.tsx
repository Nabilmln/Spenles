import { cn } from "@/lib/utils";
import { cardClass } from "@/components/ui/styles";

export function ContentCardSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(cardClass, "grid content-center gap-3 px-[1.1rem] shadow-none", className)}
    >
      <span className="h-[.9rem] w-1/3 animate-pulse motion-reduce:animate-none rounded-[.35rem] bg-surface-subtle" />
      <span className="h-[1.2rem] w-1/2 animate-pulse motion-reduce:animate-none rounded-[.35rem] bg-surface-subtle" />
    </div>
  );
}

export function ContentSkeleton() {
  return (
    <div className="grid gap-[1.25rem]" role="status" aria-live="polite">
      <span className="sr-only">Memuat konten...</span>
      <ContentCardSkeleton className="h-[7rem]" />
      <div className="grid gap-[.75rem]">
        {Array.from({ length: 4 }, (_, index) => (
          <ContentCardSkeleton key={index} className="h-[3.4rem]" />
        ))}
      </div>
    </div>
  );
}