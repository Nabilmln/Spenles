"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function MobileHomeRedirect({ destination }: { destination: string }) {
  const router = useRouter();

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 860px)");
    const goToApp = () => {
      if (mobile.matches) router.replace(destination);
    };
    goToApp();
    mobile.addEventListener("change", goToApp);
    return () => mobile.removeEventListener("change", goToApp);
  }, [destination, router]);

  return <p className="p-6 text-center text-sm text-muted">Opening Spenles…</p>;
}
