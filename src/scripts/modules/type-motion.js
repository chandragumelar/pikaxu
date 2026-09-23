// Finite, visible entrances. Content remains readable without JavaScript.
const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
const headings = [...document.querySelectorAll('main h1, .clarity-type, .share-type, .play-type, .studio-colophon h2, .bill-afterword h2, .custom-possibility h2, .quiet-fold h2, .purchase-slip h2')];
const running = new Set();

for (const heading of headings) {
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    if (!node.textContent.trim()) continue;
    const fragment = document.createDocumentFragment();
    for (const word of node.textContent.split(/(\s+)/)) {
      if (!word.trim()) { fragment.append(document.createTextNode(word)); continue; }
      const wrapper = document.createElement('span');
      wrapper.className = 'motion-word';
      // Preserve continuous words for assistive technology and text search.
      const accessible = document.createElement('span');
      accessible.className = 'visually-hidden';
      accessible.textContent = word;
      wrapper.append(accessible);
      for (const character of word) {
        const letter = document.createElement('span');
        letter.className = 'motion-letter';
        letter.setAttribute('aria-hidden', 'true');
        letter.textContent = character;
        wrapper.append(letter);
      }
      fragment.append(wrapper);
    }
    node.replaceWith(fragment);
  }
}

function stop(heading) {
  heading.querySelectorAll('.motion-letter').forEach(letter => letter.getAnimations().forEach(animation => animation.cancel()));
  running.delete(heading);
}

function play(heading) {
  stop(heading);
  if (preference.matches || document.hidden) return;
  running.add(heading);
  const letters = [...heading.querySelectorAll('.motion-letter')];
  letters.forEach((letter, index) => {
    const direction = index % 2 ? 1 : -1;
    const animation = letter.animate([
      { transform: `translateY(42px) rotate(${direction * 12}deg) scale(.8)` },
      { transform: `translateY(-12px) rotate(${-direction * 4}deg) scale(1.06)`, offset: .65 },
      { transform: 'translateY(0) rotate(0) scale(1)' },
    ], { duration: 950, delay: Math.min(index * 38, 650), easing: 'cubic-bezier(.2,.75,.2,1)' });
    animation.onfinish = () => { if (index === letters.length - 1) running.delete(heading); };
  });
}

if ('IntersectionObserver' in window && Element.prototype.animate) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? play(entry.target) : stop(entry.target));
  }, { threshold: .25 });
  headings.forEach(heading => observer.observe(heading));
  preference.addEventListener('change', () => { if (preference.matches) [...running].forEach(stop); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) [...running].forEach(stop); });
}
