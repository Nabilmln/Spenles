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
      gsap.set(photos, { autoAlpha: 0, y: 54, scale: 0.35, transformOrigin: "50% 100%" });
      gsap.set(copies, { autoAlpha: 0, y: 14 });

      const movement = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 80px",
          end: "+=150%",
          pin: true,
          scrub: 0.4,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      movement.fromTo(statement, { x: centeredX }, { x: 0, duration: 0.23, ease: "none" }, 0.03);
      photos.forEach((photo, index) => {
        const start = 0.25 + index * 0.15;
        movement
          .to(photo, { autoAlpha: 1, y: 0, scale: 1, duration: 0.11, ease: "back.out(1.15)" }, start)
          .to(copies[index], { autoAlpha: 1, y: 0, duration: 0.06, ease: "power2.out" }, start + 0.09);
      });
      movement.to({}, { duration: 0.3 }, 0.7);
    });

    return () => media.revert();
  }, []);

  return null;
}
