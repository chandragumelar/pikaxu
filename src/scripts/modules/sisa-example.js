import { exampleCopy } from '../../content/experience-copy.js';
import { createExample, formatAmount } from './example-state.js';
export function initExample(root) {
  const find = (selector) => root.querySelector(selector);
  const amount = find('[data-amount]'), fill = find('[data-fill]'), state = find('[data-state]');
  const spend = find('[data-spend]'), reset = find('[data-reset]'), controls = find('[data-controls]');
  const status = find('[data-status]'), fallback = find('[data-fallback]');
  if (![amount, fill, state, spend, reset, controls, status, fallback].every(Boolean)) return;
  const copy = exampleCopy[root.dataset.locale] ?? exampleCopy.en;
  let example;
  try { example = createExample(Number(root.dataset.initial), Number(root.dataset.expense)); }
  catch { fallback.textContent = copy.unavailable; return; }
  const render = () => {
    root.dataset.spent = String(example.spent);
    amount.textContent = formatAmount(example.amount);
    fill.style.width = `${example.fraction * 100}%`;
    state.textContent = example.spent ? `${copy.spent} · ${new Intl.NumberFormat(root.dataset.locale === 'id' ? 'id-ID' : 'en', {maximumFractionDigits:1}).format(example.fraction * 100)}% ${copy.left}` : copy.before;
    // Keep the focused control in place; aria-disabled prevents a lost keyboard position.
    spend.setAttribute('aria-disabled', String(example.spent));
  };
  spend.addEventListener('click', () => {
    if (!example.spend()) return;
    render(); status.textContent = `${copy.added} ${formatAmount(example.amount)}.`;
  });
  reset.addEventListener('click', () => {
    if (!example.reset()) return;
    render(); status.textContent = `${copy.restored} ${formatAmount(example.amount)}.`;
  });
  render(); controls.hidden = false; fallback.hidden = true;
}
if (typeof document !== 'undefined') document.querySelectorAll('[data-example]').forEach(initExample);
