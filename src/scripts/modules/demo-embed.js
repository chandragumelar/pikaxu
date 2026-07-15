// demo-embed.js — click-to-embed upgrade for the live demo specimen frame.
// Base markup is a stretched <a> (.live-demo-frame-link) covering the
// whole frame; this only runs if JS loads.

const FRAME_ID = 'live-demo-frame';
const DEMO_URL = 'https://sisa-demo.pika-xu.com';

function injectIframe(frame) {
  const iframe = document.createElement('iframe');
  iframe.src = DEMO_URL;
  iframe.title = 'sisa-app live demo';
  frame.replaceChildren(iframe);
}

function embedDemo(frame) {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    injectIframe(frame);
    return;
  }

  const duration = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--duration')
  );

  Array.from(frame.children).forEach((child) => {
    child.style.opacity = '0';
  });

  window.setTimeout(() => injectIframe(frame), duration);
}

function initDemoEmbed() {
  const frame = document.getElementById(FRAME_ID);
  if (!frame) return;

  // The stretched link and the fullscreen link are both descendants of
  // frame, so their clicks bubble here too; stopping the fullscreen
  // link's propagation (below) is what keeps it from also triggering
  // this embed.
  frame.addEventListener(
    'click',
    (event) => {
      event.preventDefault();
      embedDemo(frame);
    },
    { once: true }
  );

  const fullscreenLink = frame.querySelector('.live-demo-fullscreen');
  if (fullscreenLink) {
    fullscreenLink.addEventListener('click', (event) => event.stopPropagation());
  }
}

initDemoEmbed();
