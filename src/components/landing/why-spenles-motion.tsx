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

      const reveal = gsap.timeline({ paused: true });
      photos.forEach((photo, index) => {
        reveal
          .to(photo, { autoAlpha: 1, y: 0, scale: 1, duration: 0.38, ease: "back.out(1.15)" })
          .to(copies[index], { autoAlpha: 1, y: 0, duration: 0.24, ease: "power2.out" }, "-=0.06");
      });
      const dismissal = gsap.timeline({ paused: true }).to(detail, {
        autoAlpha: 0,
        y: 36,
        scale: 0.94,
        transformOrigin: "50% 100%",
        duration: 1,
        ease: "none",
      });

      let pending: gsap.core.Tween | undefined;
      let revealArmed = false;
      const movement = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 80px",
          end: "+=190%",
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: ({ progress }) => {
            if (progress >= 0.37 && !revealArmed) {
              revealArmed = true;
              pending = gsap.delayedCall(0.45, () => {
                pending = undefined;
                reveal.timeScale(1).play();
              });
            } else if (progress < 0.37 && revealArmed) {
              revealArmed = false;
              pending?.kill();
              pending = undefined;
              reveal.timeScale(1.6).reverse();
            }

            // Complete a skipped reveal before the section starts leaving.
            if (progress >= 0.79) {
              pending?.kill();
              pending = undefined;
              if (reveal.progress() < 1) reveal.progress(1);
            }
            dismissal.progress(gsap.utils.clamp(0, 1, (progress - 0.8) / 0.16));
          },
        },
      });

      movement
        .fromTo(statement, { x: centeredX }, { x: 0, duration: 0.3, ease: "none" }, 0.1)
        .to({}, { duration: 0.6 }, 0.4);

      return () => {
        pending?.kill();
        reveal.kill();
        dismissal.kill();
      };
    });

    return () => media.revert();
  }, []);

  return null;
}
