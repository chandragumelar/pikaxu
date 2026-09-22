// Native fragment links become a keyboard-operable set of panels only after setup.
export function initComposition(root, window) {
  const links = [...root.querySelectorAll('[data-choice]')];
  const panels = [...root.querySelectorAll('[data-panel]')];
  const index = root.querySelector('[data-choices]');
  if (links.length !== 3 || panels.length !== links.length || !index || links.some(link => !panels.some(panel => panel.dataset.panel === link.dataset.choice))) return;
  let selected = '';
  const choose = (key, updateHistory = false) => {
    const panel = panels.find(item => item.dataset.panel === key);
    if (!panel) return;
    selected = key;
    root.dataset.active = key;
    for (const item of panels) item.hidden = item !== panel;
    for (const link of links) {
      const active = link.dataset.choice === key;
      link.setAttribute('aria-selected', String(active));
      link.tabIndex = active ? 0 : -1;
    }
    if (updateHistory && window.location.hash !== `#${panel.id}`) window.history.pushState(null, '', `#${panel.id}`);
  };
  const fromLocation = () => {
    const panel = panels.find(item => `#${item.id}` === window.location.hash);
    choose(panel?.dataset.panel || (window.location.hash ? selected || 'sisa' : 'sisa'));
  };
  const onClick = event => {
    const link = event.target.closest('[data-choice]');
    if (!link || !root.contains(link) || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0) return;
    event.preventDefault();
    choose(link.dataset.choice, true);
  };
  const onKey = event => {
    const link = event.target.closest('[data-choice]');
    if (!link) return;
    const current = links.indexOf(link);
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (current + 1) % links.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (current + links.length - 1) % links.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = links.length - 1;
    else if (event.key === ' ') next = current;
    else return;
    event.preventDefault();
    choose(links[next].dataset.choice, true);
    links[next].focus();
  };
  index.setAttribute('role', 'tablist');
  links.forEach(link => { link.setAttribute('role', 'tab'); link.setAttribute('aria-controls', panels.find(panel => panel.dataset.panel === link.dataset.choice).id); });
  panels.forEach(panel => { panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', links.find(link => link.dataset.choice === panel.dataset.panel).id); panel.tabIndex = 0; });
  root.dataset.enhanced = 'true';
  fromLocation();
  root.addEventListener('click', onClick);
  root.addEventListener('keydown', onKey);
  window.addEventListener('popstate', fromLocation);
  window.addEventListener('hashchange', fromLocation);
  // BFCache restores the DOM and the example state; reconcile only the selected panel.
  window.addEventListener('pageshow', fromLocation);
  return () => {
    root.removeEventListener('click', onClick); root.removeEventListener('keydown', onKey);
    window.removeEventListener('popstate', fromLocation); window.removeEventListener('hashchange', fromLocation); window.removeEventListener('pageshow', fromLocation);
    delete root.dataset.enhanced; delete root.dataset.active;
    index.removeAttribute('role');
    links.forEach(link => { ['role','aria-controls','aria-selected','tabindex'].forEach(attr => link.removeAttribute(attr)); });
    panels.forEach(panel => { panel.hidden = false; panel.removeAttribute('role'); panel.removeAttribute('tabindex'); panel.setAttribute('aria-labelledby', panel.querySelector('h2').id); });
  };
}
if (typeof document !== 'undefined') document.querySelectorAll('[data-composition]').forEach(root => initComposition(root, window));
