/**
 * threebg.js
 * Lightweight particle background inspired by high-end neon sports visuals.
 * Uses Three.js Points + custom shaders (via PointsMaterial) to keep it fast.
 *
 * Expected:
 * - THREE is available globally (window.THREE)
 * - This script will attach a canvas to an element if present, otherwise creates one.
 *
 * Performance:
 * - Clamps devicePixelRatio
 * - Uses a single Points mesh with BufferGeometry
 * - Avoids allocations during animation
 * - Pauses on tab hidden
 */

(function () {
  const w = typeof window !== "undefined" ? window : {};
  const THREE = w.THREE;
  if (!THREE) return;

  const prefersReducedMotion = w.matchMedia
    ? w.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
  if (prefersReducedMotion) return;

  const containerIdCandidates = ["three-bg", "threeBg", "bg-canvas", "bg-canvas-wrapper"];
  let container = null;

  for (const id of containerIdCandidates) {
    const el = document.getElementById(id);
    if (el) {
      container = el;
      break;
    }
  }

  // If no container, create one at body level.
  if (!container) {
    container = document.createElement("div");
    container.id = "three-bg";
    container.className = "fixed inset-0 -z-10 pointer-events-none";
    document.body.prepend(container);
  } else {
    // Ensure it can host a canvas
    if (!container.classList.contains("-z-10")) container.classList.add("-z-10");
    container.classList.add("pointer-events-none");
    container.classList.add("fixed", "inset-0");
  }

  // Avoid double-init
  if (container.dataset.threebgInit === "1") return;
  container.dataset.threebgInit = "1";

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const DPR_MAX = 1.5;
  const BASE_PARTICLES = 2200; // will scale down for small screens
  const SMALL_SCREEN_PARTICLES = 1400;

  // Scene setup
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 120);
  camera.position.set(0, 0, 24);

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false, // keep it fast
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(DPR_MAX, w.devicePixelRatio || 1));
  renderer.setClearAlpha(0);
  container.appendChild(renderer.domElement);

  // Geometry: particle field in a wide volume
  const makeParticleCount = () => {
    const wpx = window.innerWidth || 1024;
    const hpx = window.innerHeight || 768;
    const area = wpx * hpx;
    const isSmall = wpx < 768 || area < 900000;
    return isSmall ? SMALL_SCREEN_PARTICLES : BASE_PARTICLES;
  };

  let particleCount = makeParticleCount();

  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const twinkle = new Float32Array(particleCount);

  // Create a “tunnel” / depth distribution
  // We bias radius so it looks like a futuristic field.
  const rand = (a, b) => a + Math.random() * (b - a);
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;

    // depth (z) forward/back
    const z = rand(-35, 10);

    // radius distribution (more points near center)
    const r = Math.pow(Math.random(), 0.55) * 18;

    const theta = rand(0, Math.PI * 2);
    const x = Math.cos(theta) * r;
    const y = (Math.random() - 0.5) * 18;

    positions[i3 + 0] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    // neon-ish palette: emerald + subtle white
    const emerald = Math.random();
    const c1 = emerald > 0.55 ? [0.12, 1.0, 0.55] : [0.35, 1.0, 0.75];
    const c2 = emerald > 0.55 ? [0.05, 0.8, 0.38] : [0.2, 1.0, 0.6];
    const mix = rand(0, 1);

    colors[i3 + 0] = c1[0] * (1 - mix) + c2[0] * mix;
    colors[i3 + 1] = c1[1] * (1 - mix) + c2[1] * mix;
    colors[i3 + 2] = c1[2] * (1 - mix) + c2[2] * mix;

    twinkle[i] = rand(0, 1);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("twinkle", new THREE.BufferAttribute(twinkle, 1));

  // Points material
  const material = new THREE.PointsMaterial({
    size: 0.06,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    vertexColors: true,
    color: 0x34d399, // fallback
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // Lights aren't needed; PointsMaterial is vertex-colored.

  // Mouse parallax
  const mouse = { x: 0, y: 0 };
  const targetMouse = { x: 0, y: 0 };

  const onMouseMove = (e) => {
    // Normalize to [-1, 1]
    const nx = (e.clientX / (window.innerWidth || 1)) * 2 - 1;
    const ny = (e.clientY / (window.innerHeight || 1)) * 2 - 1;
    targetMouse.x = nx;
    targetMouse.y = ny;
  };

  w.addEventListener("mousemove", onMouseMove, { passive: true });

  // Resize
  let width = 1;
  let height = 1;

  const resize = () => {
    width = container.clientWidth || window.innerWidth || 1;
    height = container.clientHeight || window.innerHeight || 1;

    renderer.setPixelRatio(Math.min(DPR_MAX, w.devicePixelRatio || 1));
    renderer.setSize(width, height, false);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // Slightly adapt particle size on mobile
    const isSmall = (window.innerWidth || 1024) < 768;
    material.size = isSmall ? 0.055 : 0.065;
  };

  w.addEventListener("resize", resize, { passive: true });

  resize();

  // Animation loop
  let raf = 0;
  let running = true;
  const onVisibility = () => {
    running = !document.hidden;
    if (running) start();
  };
  document.addEventListener("visibilitychange", onVisibility);

  // Avoid re-allocations:
  const posAttr = geometry.getAttribute("position");
  const twAttr = geometry.getAttribute("twinkle");

  let startTime = performance.now();
  let lastFrame = startTime;

  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (!running) return;

    const now = performance.now();
    const dt = clamp((now - lastFrame) / 16.6667, 0.25, 2.0);
    lastFrame = now;

    // Ease mouse towards target
    mouse.x += (targetMouse.x - mouse.x) * 0.05;
    mouse.y += (targetMouse.y - mouse.y) * 0.05;

    const t = (now - startTime) * 0.001;

    // Subtle camera parallax
    camera.position.x = mouse.x * 1.2;
    camera.position.y = -mouse.y * 0.9;

    // Move points in a slow swirl / drift; recycle particles when out of bounds
    // Keep it very lightweight: only update positions array and flag needsUpdate.
    // We keep z in range and wrap around.
    const maxZ = 14;
    const minZ = -40;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      const x0 = posAttr.array[i3 + 0];
      const y0 = posAttr.array[i3 + 1];
      let z0 = posAttr.array[i3 + 2];

      // Twinkle-driven micro motion
      const tw = twAttr.array[i];
      const s = 0.55 + tw * 1.25;

      // Swirl around center
      const swirl = Math.sin(t * 0.55 + tw * 6.283) * 0.015 * s;

      posAttr.array[i3 + 0] = x0 * (1 - 0.0005) + Math.cos(t * 0.25 + tw * 10) * 0.01 * s + swirl;
      posAttr.array[i3 + 1] = y0 * (1 - 0.0005) + Math.sin(t * 0.25 + tw * 10) * 0.01 * s - swirl;

      // Forward drift
      z0 += 0.035 * dt * (0.6 + tw) * s;
      if (z0 > maxZ) z0 = minZ;

      posAttr.array[i3 + 2] = z0;
    }

    posAttr.needsUpdate = true;

    // Tiny opacity pulse for premium feel
    material.opacity = 0.82 + Math.sin(t * 0.9) * 0.04;

    renderer.render(scene, camera);
  };

  const start = () => {
    cancelAnimationFrame(raf);
    lastFrame = performance.now();
    raf = requestAnimationFrame(tick);
  };

  start();

  // Cleanup hook if your app ever hot-reloads this script
  // (Not strictly required, but good practice.)
  w.__threebgCleanup = () => {
    try {
      cancelAnimationFrame(raf);
      w.removeEventListener("mousemove", onMouseMove);
      w.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    } catch (e) {
      // ignore
    }
  };
})();
