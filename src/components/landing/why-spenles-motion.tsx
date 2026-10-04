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
    const photos = [...detail.querySelectorAll<HTMLElement>("[data-why-photo]")];
    const copies = [...detail.querySelectorAll<HTMLElement>("[data-why-copy]")];
    if (photos.length !== 3 || copies.length !== 3) return;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(min-width: 981px) and (prefers-reduced-motion: no-preference)", () => {
      const centeredX = () => stage.clientWidth / 2 - statement.offsetLeft - statement.offsetWidth / 2;
      gsap.set(photos, { autoAlpha: 0, y: 72, scale: 0.97, transformOrigin: "center bottom" });
      gsap.set(copies, { autoAlpha: 0, y: 20 });
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 80px",
          end: "+=180%",
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .fromTo(statement, { x: centeredX }, { x: 0, duration: 0.34, ease: "none" }, 0.1)
        .to(photos[0], { autoAlpha: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }, 0.35)
        .to(copies[0], { autoAlpha: 1, y: 0, duration: 0.14, ease: "power2.out" }, 0.53)
        .to(photos[1], { autoAlpha: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }, 0.63)
        .to(copies[1], { autoAlpha: 1, y: 0, duration: 0.14, ease: "power2.out" }, 0.81)
        .to(photos[2], { autoAlpha: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }, 0.91)
        .to(copies[2], { autoAlpha: 1, y: 0, duration: 0.14, ease: "power2.out" }, 1.09)
        .to({}, { duration: 0.18 }, 1.23);
    });

    return () => media.revert();
  }, []);

  return null;
}
