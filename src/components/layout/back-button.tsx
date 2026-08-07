"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton({ fallback }: { fallback?: string }) {
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
      className="icon-button back-button"
      onClick={goBack}
      aria-label="Kembali"
      title="Kembali"
    >
      <ArrowLeft size={20} aria-hidden="true" />
    </button>
  );
}