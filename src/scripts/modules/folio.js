// Deep links open native disclosures. Without JS every summary still works.
export function initFolio(root, window) {
  const openFragment = () => {
    let id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
    const fold = [...root.querySelectorAll('.folio-fold')].find(item => item.id === id);
    if (!fold) return;
    fold.open = true;
    fold.scrollIntoView({ block: 'start', behavior: 'instant' });
  };
  window.addEventListener('hashchange', openFragment);
  window.addEventListener('pageshow', openFragment);
  openFragment();
  return () => { window.removeEventListener('hashchange', openFragment); window.removeEventListener('pageshow', openFragment); };
}
if (typeof document !== 'undefined') document.querySelectorAll('[data-folio]').forEach(root => initFolio(root, window));
