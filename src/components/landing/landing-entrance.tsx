"use client";

import { useLayoutEffect } from "react";
import { gsap } from "gsap";

export function LandingEntrance() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-landing-root]");
    if (!root) return;

    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const reloaded = navigation?.type === "reload";
    let resetFrame = 0;
    if (reloaded && root.getClientRects().length) {
      // Hydration can finish after the browser attempts to restore its old position.
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      resetFrame = requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let context: gsap.Context | undefined;

    function setUpEntrance() {
      context?.revert();
      context = undefined;
      if (reducedMotion.matches || !root?.getClientRects().length) return;

      const logo = root.querySelector<HTMLElement>("[data-entry-logo]");
      const words = root.querySelectorAll<HTMLElement>("[data-entry-word]");
      const description = root.querySelector<HTMLElement>("[data-entry-description]");
      const buttons = root.querySelectorAll<HTMLElement>("[data-entry-action]");
      const navigation = root.querySelectorAll<HTMLElement>("[data-entry-nav]");
      if (!logo || !words.length || !description || !buttons.length || !navigation.length) return;

      context = gsap.context(() => {
        gsap.set(logo, { autoAlpha: 0, y: -16, scale: 0.96 });
        gsap.set(words, { autoAlpha: 0, yPercent: -110 });
        gsap.set(description, { autoAlpha: 0, filter: "blur(8px)", y: 14 });
        gsap.set(buttons, { autoAlpha: 0, x: (index: number) => index === 0 ? -36 : 36 });
        gsap.set(navigation, { clipPath: "inset(0 0 100% 0)", y: -14 });

        const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
        timeline
          .to(logo, { autoAlpha: 1, y: 0, scale: 1, duration: 0.68 }, 0.08)
          .to(words, { autoAlpha: 1, yPercent: 0, duration: 0.68, stagger: 0.12 }, 0.18)
          .to(description, { autoAlpha: 1, filter: "blur(0px)", y: 0, duration: 0.72 }, 0.74)
          .to(buttons, { autoAlpha: 1, x: 0, duration: 0.7, stagger: 0.1 }, 1.05)
          .to(navigation, { clipPath: "inset(0 0 0% 0)", y: 0, duration: 0.72, stagger: 0.08 }, 1);
      }, root);
    }

    setUpEntrance();
    reducedMotion.addEventListener("change", setUpEntrance);
    return () => {
      if (resetFrame) cancelAnimationFrame(resetFrame);
      reducedMotion.removeEventListener("change", setUpEntrance);
      context?.revert();
    };
  }, []);

  return null;
}
