"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton({
  fallback,
  title,
}: {
  fallback?: string;
  title?: string;
}) {
  const router = useRouter();

  function goBack() {
    if (fallback && window.history.length <= 1) {
      router.push(fallback);
    } else {
      router.back();
    }
  }

  return (
    <button
      type="button"
      className="group inline-flex min-h-[2.75rem] max-w-[60vw] cursor-pointer items-center gap-[.55rem] rounded-full border-0 bg-transparent p-0 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
      onClick={goBack}
      aria-label={`Back to ${title ?? "previous page"}`}
      title={title ?? "Back"}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface ring-1 ring-border transition-colors group-hover:bg-surface-subtle">
        <ChevronLeft size={22} aria-hidden="true" className="text-foreground" />
      </span>
      {title ? (
        <span className="min-w-0 truncate text-[.95rem] font-medium">
          {title}
        </span>
      ) : null}
    </button>
  );
}
