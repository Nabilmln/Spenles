"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppLaunchScreen } from "@/components/feedback/app-launch-screen";

export function MobileHomeRedirect({ destination }: { destination: string }) {
  const router = useRouter();

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 600px)");
    const goToApp = () => {
      if (mobile.matches) router.replace(destination);
    };
    goToApp();
    mobile.addEventListener("change", goToApp);
    return () => mobile.removeEventListener("change", goToApp);
  }, [destination, router]);

  return <AppLaunchScreen />;
}
