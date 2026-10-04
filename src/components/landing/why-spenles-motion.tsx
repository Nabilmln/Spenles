"use client";

import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function WhySpenlesMotion() {
  useLayoutEffect(() => {
    const section = document.querySelector<HTMLElement>("[data-why-section]");
    const stage = section?.querySelector<HTMLElement>("[data-why-stage]");
    const statement = section?.querySelector<HTMLElement>("[data-why-statement]");
    const detail = section?.querySelector<HTMLElement>("[data-why-detail]");
    if (!section || !stage || !statement || !detail) return;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(min-width: 981px) and (prefers-reduced-motion: no-preference)", () => {
      const centeredX = () => stage.clientWidth / 2 - statement.offsetLeft - statement.offsetWidth / 2;
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 80px",
          end: "+=115%",
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .fromTo(statement, { x: centeredX }, { x: 0, duration: 0.42, ease: "none" }, 0.2)
        .fromTo(detail, { autoAlpha: 0, x: 84 }, { autoAlpha: 1, x: 0, duration: 0.38, ease: "none" }, 0.49)
        .to({}, { duration: 0.13 }, 0.87);
    });

    return () => media.revert();
  }, []);

  return null;
}
