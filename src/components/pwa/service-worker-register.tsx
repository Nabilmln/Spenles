"use client";

import { useEffect } from "react";
import { createControllerChangeHandler } from "./controller-change";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (!window.isSecureContext) return;

    const hadInitialController = navigator.serviceWorker.controller !== null;
    const onControllerChange = createControllerChangeHandler({
      hadInitialController,
      reload: () => window.location.reload(),
    });
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );

    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .catch(() => {
        // Registration is best-effort; ignore failures so the app keeps working.
      });

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    };
  }, []);

  return null;
}