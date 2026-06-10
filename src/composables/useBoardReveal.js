import { onMounted, onBeforeUnmount } from "vue";
import gsap from "gsap";

/**
 * Staggered "pinned to the board" reveal: each selector group drifts up and
 * settles into place the first time it scrolls into view.
 *
 * clearProps removes GSAP's inline transform afterwards so the stylesheet
 * rotations / hover transforms keep working.
 */
export function useBoardReveal(rootRef, groups) {
  const observers = [];

  onMounted(() => {
    const root = rootRef.value;
    if (!root || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    groups.forEach((selector) => {
      const els = Array.from(root.querySelectorAll(selector));
      if (!els.length) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            observer.disconnect();
            gsap.from(els, {
              opacity: 0,
              y: 26,
              duration: 0.55,
              stagger: 0.08,
              ease: "power2.out",
              clearProps: "transform,opacity",
            });
          }
        },
        { threshold: 0.15 }
      );
      observer.observe(els[0]);
      observers.push(observer);
    });
  });

  onBeforeUnmount(() => observers.forEach((o) => o.disconnect()));
}
