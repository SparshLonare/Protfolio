/**
 * Textured plane with mouse-reactive parallax tilt.
 * Loads a transparent PNG onto a Three.js plane, composited over a transparent
 * WebGL clear color so the container's CSS background (e.g. black) shows through
 * cleanly with zero checkerboard artifacts.
 *
 * Usage: include Three.js (r128) via CDN, then this file, then call:
 *   initParallaxImage('interactive-hero-canvas-container', '/static/img/your-image.png');
 */

function initParallaxImage(containerId, imageUrl, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`[parallax-image] container #${containerId} not found`);
    return;
  }

  const cfg = {
    maxTiltX: options.maxTiltX ?? 0.25,
    maxTiltY: options.maxTiltY ?? 0.35,
    maxShiftX: options.maxShiftX ?? 0.25,
    maxShiftY: options.maxShiftY ?? 0.15,
    ease: options.ease ?? 0.08,
    hoverLift: options.hoverLift ?? 0.3,
    idleDriftSpeed: options.idleDriftSpeed ?? 0.15,
    planeWidth: options.planeWidth ?? 4,
  };

  let width = container.clientWidth;
  let height = container.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);
  renderer.domElement.style.display = 'block';

  let plane = null;
  const loader = new THREE.TextureLoader();

  loader.load(
    imageUrl,
    (texture) => {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const imgAspect = texture.image.width / texture.image.height;
      const planeWidth = cfg.planeWidth;
      const planeHeight = planeWidth / imgAspect;

      const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.01,
        side: THREE.DoubleSide,
        depthWrite: true,
      });

      plane = new THREE.Mesh(geometry, material);
      scene.add(plane);
    },
    undefined,
    (err) => {
      console.error('[parallax-image] failed to load texture:', err);
    }
  );

  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;
  let targetShiftX = 0;
  let targetShiftY = 0;
  let currentShiftX = 0;
  let currentShiftY = 0;
  let isHovering = false;
  let currentScale = 1;
  let lastInteraction = Date.now();
  const IDLE_TIMEOUT = 2500;

  function onPointerMove(e) {
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const inBounds = x >= 0 && x <= 1 && y >= 0 && y <= 1;
    isHovering = inBounds;

    const nx = x - 0.5;
    const ny = y - 0.5;

    targetTiltY = nx * cfg.maxTiltY * 2;
    targetTiltX = -ny * cfg.maxTiltX * 2;
    targetShiftX = nx * cfg.maxShiftX * 2;
    targetShiftY = -ny * cfg.maxShiftY * 2;

    lastInteraction = Date.now();
  }
  window.addEventListener('mousemove', onPointerMove, { passive: true });

  function onResize() {
    width = container.clientWidth;
    height = container.clientHeight;
    if (width === 0 || height === 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onResize);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsed = clock.elapsedTime;

    if (!plane) {
      renderer.render(scene, camera);
      return;
    }

    if (prefersReducedMotion) {
      plane.rotation.set(0, 0, 0);
      plane.position.set(0, 0, 0);
      renderer.render(scene, camera);
      return;
    }

    const sinceInteraction = Date.now() - lastInteraction;
    const isIdle = sinceInteraction > IDLE_TIMEOUT;

    if (isIdle) {
      targetTiltY = Math.sin(elapsed * cfg.idleDriftSpeed) * cfg.maxTiltY * 0.4;
      targetTiltX = Math.cos(elapsed * cfg.idleDriftSpeed * 0.7) * cfg.maxTiltX * 0.3;
      targetShiftX = Math.sin(elapsed * cfg.idleDriftSpeed) * cfg.maxShiftX * 0.3;
      targetShiftY = Math.cos(elapsed * cfg.idleDriftSpeed * 0.8) * cfg.maxShiftY * 0.3;
    }

    currentTiltX += (targetTiltX - currentTiltX) * cfg.ease;
    currentTiltY += (targetTiltY - currentTiltY) * cfg.ease;
    currentShiftX += (targetShiftX - currentShiftX) * cfg.ease;
    currentShiftY += (targetShiftY - currentShiftY) * cfg.ease;

    plane.rotation.x = currentTiltX;
    plane.rotation.y = currentTiltY;
    plane.position.x = currentShiftX;
    plane.position.y = currentShiftY;

    const targetScale = isHovering && !isIdle ? 1 + cfg.hoverLift * 0.1 : 1;
    currentScale += (targetScale - currentScale) * 0.1;
    plane.scale.setScalar(currentScale);

    renderer.render(scene, camera);
  }

  animate();

  return function destroy() {
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('resize', onResize);
    if (plane) {
      plane.geometry.dispose();
      plane.material.map?.dispose();
      plane.material.dispose();
      scene.remove(plane);
    }
    container.removeChild(renderer.domElement);
    renderer.dispose();
  };
}