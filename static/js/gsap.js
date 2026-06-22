/**
 * gsap.js — GSAP + ScrollTrigger animations
 *
 * Hero: entrance timeline on page load (no ScrollTrigger).
 * Sections: .reveal elements animate on scroll via ScrollTrigger.
 * .reveal-group: children animate with stagger when parent enters viewport.
 */

window.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // ─── Hero entrance timeline ─────────────────────────────────────
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Nav slides down
  heroTl.fromTo('nav',
    { y: -40, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7 }
  );

  // Hero label (top-left "AI & Data Science — YCCE Nagpur")
  heroTl.fromTo('#hero .hero-label',
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6 },
    '-=0.3'
  );

  // Hero name — slides up
  heroTl.fromTo('#hero h1',
    { y: 60, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.9 },
    '-=0.35'
  );

  // Divider grows from left
  heroTl.fromTo('#hero .hero-divider',
    { scaleX: 0, transformOrigin: 'left center' },
    { scaleX: 1, duration: 0.6 },
    '-=0.4'
  );

  // Description fades up
  heroTl.fromTo('#hero .hero-desc',
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6 },
    '-=0.3'
  );

  // Scroll hint fades in
  heroTl.fromTo('#hero .hero-scroll',
    { opacity: 0 },
    { opacity: 1, duration: 0.5 },
    '-=0.2'
  );

  // ─── Scroll-triggered .reveal elements ──────────────────────────
  document.querySelectorAll('.reveal').forEach((el) => {
    gsap.fromTo(el,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        }
      }
    );
  });

  // ─── Staggered groups ───────────────────────────────────────────
  // Parent has .reveal-group, children animate with stagger
  document.querySelectorAll('.reveal-group').forEach((group) => {
    const children = group.children;
    gsap.fromTo(children,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: group,
          start: 'top 88%',
          toggleActions: 'play none none none',
        }
      }
    );
  });

  // ─── Counter animation for stats ────────────────────────────────
  document.querySelectorAll('.stat-number').forEach((el) => {
    const endVal = el.textContent;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }
    });
  });
});