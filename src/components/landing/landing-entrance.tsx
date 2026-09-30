"use client";

import { useLayoutEffect } from "react";
import { gsap } from "gsap";

export function LandingEntrance() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-landing-root]");
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let context: gsap.Context | undefined;

    function setUpEntrance() {
      context?.revert();
      context = undefined;
      if (reducedMotion.matches || !root?.getClientRects().length) return;

      const title = root.querySelector<HTMLElement>("[data-entry-title]");
      const description = root.querySelector<HTMLElement>("[data-entry-description]");
      const buttons = root.querySelectorAll<HTMLElement>("[data-entry-action]");
      const navigation = root.querySelectorAll<HTMLElement>("[data-entry-nav]");
      if (!title || !description || !buttons.length || !navigation.length) return;

      context = gsap.context(() => {
        gsap.set(title, { clipPath: "inset(0 0 100% 0)", y: 28 });
        gsap.set(description, { autoAlpha: 0, filter: "blur(8px)", y: 14 });
        gsap.set(buttons, { autoAlpha: 0, y: 28, scale: 0.94 });
        gsap.set(navigation, { clipPath: "inset(0 0 100% 0)", y: -14 });

        const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
        timeline
          .to(title, { clipPath: "inset(0 0 0% 0)", y: 0, duration: 0.85 }, 0.1)
          .to(description, { autoAlpha: 1, filter: "blur(0px)", y: 0, duration: 0.78 }, 0.42)
          .to(buttons, { autoAlpha: 1, y: 0, scale: 1, duration: 0.62, stagger: 0.12 }, 1.08)
          .to(navigation, { clipPath: "inset(0 0 0% 0)", y: 0, duration: 0.76, stagger: 0.1 }, 2);
      }, root);
    }

    setUpEntrance();
    reducedMotion.addEventListener("change", setUpEntrance);
    return () => {
      reducedMotion.removeEventListener("change", setUpEntrance);
      context?.revert();
    };
  }, []);

  return null;
}
