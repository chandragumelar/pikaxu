const rootStyles = getComputedStyle(document.documentElement);

function getWeightRange() {
  const rest = parseFloat(rootStyles.getPropertyValue('--wght-rest'));
  const full = parseFloat(rootStyles.getPropertyValue('--wght-full'));
  return { rest, full };
}

function getScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return 0;
  return Math.min(Math.max(window.scrollY / scrollable, 0), 1);
}

function applyWeight(el, progress, range) {
  const weight = range.rest + (range.full - range.rest) * progress;
  el.style.fontVariationSettings = `"wght" ${weight}`;
}

function initScrollType() {
  const wordmark = document.querySelector('.hero-wordmark');
  if (!wordmark) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  if (prefersReducedMotion) return;

  const range = getWeightRange();
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      applyWeight(wordmark, getScrollProgress(), range);
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  applyWeight(wordmark, getScrollProgress(), range);
}

initScrollType();
