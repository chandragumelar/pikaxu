// demo-embed.js — click-to-embed upgrade for the live demo specimen frame.
// Base markup is a stretched <a> (.live-demo-frame-link) covering the
// swap area; this only runs if JS loads.

const FRAME_ID = 'live-demo-frame';
const DEMO_URL = 'https://sisa-demo.pika-xu.com';

function injectIframe(swap) {
  const iframe = document.createElement('iframe');
  iframe.src = DEMO_URL;
  iframe.title = 'sisa-app live demo';
  swap.replaceChildren(iframe);
}

function embedDemo(swap) {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    injectIframe(swap);
    return;
  }

  const duration = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--duration')
  );

  Array.from(swap.children).forEach((child) => {
    child.style.opacity = '0';
  });

  window.setTimeout(() => injectIframe(swap), duration);
}

function initDemoEmbed() {
  const frame = document.getElementById(FRAME_ID);
  if (!frame) return;

  // Only .live-demo-swap's children are ever replaced — .live-demo-
  // controls (the fullscreen link) is a sibling outside it, so it's
  // never a click target here and never gets wiped by the embed.
  const swap = frame.querySelector('.live-demo-swap');
  if (!swap) return;

  swap.addEventListener(
    'click',
    (event) => {
      event.preventDefault();
      embedDemo(swap);
    },
    { once: true }
  );
}

initDemoEmbed();
