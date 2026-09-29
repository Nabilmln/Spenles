"use client";

import { useEffect } from "react";

const offsets: Record<string, string> = {
  up: "translate3d(0, 24px, 0)",
  left: "translate3d(-28px, 0, 0)",
  right: "translate3d(28px, 0, 0)",
};

export function LandingMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-landing-root]");
    if (
      !root ||
      !window.IntersectionObserver ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        const offset = offsets[element.dataset.reveal ?? "up"];
        const start = offset ? { opacity: 0, transform: offset } : { opacity: 0 };
        const end = offset
          ? { opacity: 1, transform: "translate3d(0, 0, 0)" }
          : { opacity: 1 };

        element.animate([start, end], {
          duration: 680,
          delay: Math.min(Number(element.dataset.delay) || 0, 200),
          easing: "cubic-bezier(0.2, 0.75, 0.25, 1)",
          fill: "backwards",
        });
        observer.unobserve(element);
      }
    }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });

    root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return null;
}
