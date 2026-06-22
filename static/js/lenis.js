/**
 * lenis.js
 * Smooth scrolling using Lenis + integration with GSAP ScrollTrigger.
 *
 * Requirements:
 * - Lenis runs inside requestAnimationFrame
 * - On scroll, ScrollTrigger updates with Lenis scroll position
 * - Works gracefully if Lenis/GSAP/ScrollTrigger are not available
 */

(function () {
  const w = typeof window !== "undefined" ? window : {};
  const Lenis = w.Lenis;
  const gsap = w.gsap;
  const ScrollTrigger = w.ScrollTrigger;

  // Graceful no-op if Lenis isn't present
  if (!Lenis) return;

  // Optional integration: only if ScrollTrigger exists
  const hasScrollTrigger = !!(gsap && ScrollTrigger);

  // Reduced motion preference
  const prefersReducedMotion = w.matchMedia
    ? w.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
  if (prefersReducedMotion) return;

  // Avoid double-init
  if (w.__lenisInit === true) return;
  w.__lenisInit = true;

  // Instantiate Lenis
  const lenis = new Lenis({
    lerp: 0.085,
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 1,
    touchMultiplier: 1,
    normalizeWheel: true,
    duration: 1.2,
    infinite: false,
  });

  // Expose for debugging/other scripts
  w.lenis = lenis;

  function raf(time) {
    lenis.raf(time);
    if (hasScrollTrigger) ScrollTrigger.update(); // ensure ScrollTrigger stays in sync
    w.requestAnimationFrame(raf);
  }

  // Kick off
  w.requestAnimationFrame(raf);

  // Let ScrollTrigger know about Lenis-driven scrolling
  if (hasScrollTrigger) {
    // Some GSAP versions benefit from refresh after init
    try {
      ScrollTrigger.refresh(true);
    } catch (e) {
      // ignore
    }

    // In case other code uses scroll events, keep ScrollTrigger synced
    lenis.on("scroll", () => {
      try {
        ScrollTrigger.update();
      } catch (e) {
        // ignore
      }
    });
  }

  // Handle hash navigation: ensure Lenis positions correctly and refresh triggers
  w.addEventListener("hashchange", () => {
    if (!hasScrollTrigger) return;
    setTimeout(() => {
      try {
        ScrollTrigger.refresh(true);
      } catch (e) {
        // ignore
      }
    }, 250);
  });
})();
