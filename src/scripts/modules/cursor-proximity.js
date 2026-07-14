// cursor-proximity.js — letters near the cursor thicken. Only ever writes
// --wght-boost per letter; scroll-type.js only ever writes --wght-scroll on
// the wordmark. hero.css composes the two via clamp(), so this module never
// has to read or coordinate with the other's output.

// How far (px) from a letter's center the cursor still has influence.
// Tuned so the boost reads as a localized ripple under the pointer, not a
// page-wide wash — roughly one letter-width at the mid hero size.
const PROXIMITY_RADIUS = 220;

// Max additive weight at zero distance. This is added on top of whatever
// scroll-type.js already set; hero.css's clamp() against --wght-full is
// what actually enforces the Manrope axis ceiling, so this just needs to
// be generous enough to reach it from a rest-weight baseline.
const MAX_BOOST = 600;

// Fraction of the remaining distance to the target boost closed per frame.
// Low value makes the weight "chase" the cursor smoothly instead of
// snapping when the pointer moves fast.
const LERP_FACTOR = 0.15;

function canUseProximity() {
  const noHover = window.matchMedia('(hover: none)').matches;
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  return !noHover && !reducedMotion;
}

function measureLetters(letters) {
  return letters.map((el) => {
    const rect = el.getBoundingClientRect();
    return { el, cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 };
  });
}

function initCursorProximity() {
  if (!canUseProximity()) return;

  const letters = Array.from(document.querySelectorAll('.hero-letter'));
  if (!letters.length) return;

  const boosts = new WeakMap();
  for (const el of letters) boosts.set(el, 0);

  // Letter positions are cached and only recomputed on resize/scroll, not
  // on every mousemove or animation frame, so getBoundingClientRect (a
  // layout read) can't turn this into a per-frame layout thrash.
  let positions = measureLetters(letters);
  let mouseX = -Infinity;
  let mouseY = -Infinity;

  function recalcPositions() {
    positions = measureLetters(letters);
  }

  function onMouseMove(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
  }

  function onMouseLeave() {
    mouseX = -Infinity;
    mouseY = -Infinity;
  }

  function tick() {
    for (const { el, cx, cy } of positions) {
      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const target =
        distance < PROXIMITY_RADIUS
          ? MAX_BOOST * (1 - distance / PROXIMITY_RADIUS)
          : 0;
      const current = boosts.get(el);
      const next = current + (target - current) * LERP_FACTOR;
      boosts.set(el, next);
      el.style.setProperty('--wght-boost', next.toFixed(1));
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('mouseleave', onMouseLeave, { passive: true });
  window.addEventListener('resize', recalcPositions, { passive: true });
  window.addEventListener('scroll', recalcPositions, { passive: true });

  requestAnimationFrame(tick);
}

initCursorProximity();
