"use client";

import { useEffect } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => value * value * (3 - 2 * value);

export function LandingMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-landing-root]");
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reveals = [...root.querySelectorAll<HTMLElement>("[data-reveal]")];
    const budgetFill = root.querySelector<HTMLElement>("[role='progressbar'] i");
    const chartLines = [...root.querySelectorAll<SVGPathElement>(".landing-trend-line")];
    let frame = 0;

    function clearMotion() {
      for (const element of reveals) {
        element.style.removeProperty("opacity");
        element.style.removeProperty("translate");
      }
      budgetFill?.style.removeProperty("transform");
      for (const line of chartLines) {
        line.style.removeProperty("stroke-dasharray");
        line.style.removeProperty("stroke-dashoffset");
      }
    }

    function update() {
      frame = 0;
      if (reducedMotion.matches) {
        clearMotion();
        return;
      }
      if (!root?.getClientRects().length) return;

      const viewport = window.innerHeight;
      // The same viewport progress drives both directions of the scroll.
      const progressFor = (element: Element) => {
        const rect = element.getBoundingClientRect();
        return clamp((viewport - rect.top) / (viewport + rect.height));
      };
      const revealProgress = reveals.map(progressFor);
      const budgetProgress = budgetFill ? progressFor(budgetFill) : 0;
      const chartProgress = chartLines.map(progressFor);

      reveals.forEach((element, index) => {
        const delay = Math.min(Number(element.dataset.delay) || 0, 200) / 3000;
        const progress = clamp(revealProgress[index] - delay);
        const enter = ease(clamp(progress / 0.2));
        const leave = ease(clamp((1 - progress) / 0.18));
        const visibility = Math.min(enter, leave);
        const direction = element.dataset.reveal;
        const distance = direction === "left" ? -24 : direction === "right" ? 24 : direction === "fade" ? 0 : 22;
        const shift = (1 - enter) * distance - (1 - leave) * distance * 0.7;
        element.style.opacity = visibility.toFixed(3);
        element.style.translate = direction === "left" || direction === "right"
          ? `${shift.toFixed(1)}px 0`
          : `0 ${shift.toFixed(1)}px`;
      });

      if (budgetFill) {
        budgetFill.style.transform = `scaleX(${ease(clamp(budgetProgress / 0.42)).toFixed(3)})`;
      }
      chartLines.forEach((line, index) => {
        line.style.strokeDasharray = "1";
        line.style.strokeDashoffset = (1 - ease(clamp(chartProgress[index] / 0.44))).toFixed(3);
      });
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    document.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reducedMotion.addEventListener("change", schedule);
    schedule();

    return () => {
      document.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reducedMotion.removeEventListener("change", schedule);
      if (frame) cancelAnimationFrame(frame);
      clearMotion();
    };
  }, []);

  return null;
}
