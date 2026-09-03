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
      className="-mx-2 inline-flex min-h-[2.5rem] max-w-[60vw] cursor-pointer items-center gap-[.25rem] rounded-[.6rem] border-0 bg-transparent p-2 text-foreground transition-colors hover:bg-surface-subtle focus-visible:bg-surface-subtle focus-visible:outline-none"
      onClick={goBack}
      aria-label={`Back to ${title ?? "previous page"}`}
      title={title ?? "Back"}
    >
      <ChevronLeft
        size={22}
        aria-hidden="true"
        className="shrink-0 text-primary-600 dark:text-primary-700"
      />
      {title ? (
        <span className="min-w-0 truncate text-[.95rem] font-medium">
          {title}
        </span>
      ) : null}
    </button>
  );
}