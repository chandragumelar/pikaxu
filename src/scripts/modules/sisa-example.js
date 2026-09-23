import { exampleCopy } from '../../content/experience-copy.js';
import { createExample, formatAmount } from './example-state.js';
export function initExample(root) {
  const find = (selector) => root.querySelector(selector);
  const amount = find('[data-amount]'), fill = find('[data-fill]'), state = find('[data-state]');
  const coffee = find('[data-coffee-spend]');
  const spend = find('[data-spend]'), reset = find('[data-reset]'), controls = find('[data-controls]');
  const status = find('[data-status]'), fallback = find('[data-fallback]');
  if (![amount, fill, state, spend, coffee, reset, controls, status, fallback].every(Boolean)) return;
  const copy = exampleCopy[root.dataset.locale] ?? exampleCopy.en;
  let example;
  try { example = createExample(Number(root.dataset.initial), Number(root.dataset.expense), Number(root.dataset.coffee)); }
  catch { fallback.textContent = copy.unavailable; return; }
  const render = () => {
    root.dataset.spent = String(example.spent || example.coffeeSpent);
    amount.textContent = formatAmount(example.amount);
    fill.style.width = `${example.fraction * 100}%`;
    const label = example.spent && example.coffeeSpent ? copy.bothSpent : example.coffeeSpent ? copy.coffeeSpent : copy.spent;
    state.textContent = example.spent || example.coffeeSpent ? `${label} · ${new Intl.NumberFormat(root.dataset.locale === 'id' ? 'id-ID' : 'en', {maximumFractionDigits:1}).format(example.fraction * 100)}% ${copy.left}` : copy.before;
    // Keep the focused control in place; aria-disabled prevents a lost keyboard position.
    spend.setAttribute('aria-disabled', String(example.spent));
    coffee.setAttribute('aria-disabled', String(example.coffeeSpent));
  };
  spend.addEventListener('click', () => {
    if (!example.spend()) return;
    render(); status.textContent = `${copy.added} ${formatAmount(example.amount)}.`;
  });
  coffee.addEventListener('click', () => {
    if (!example.coffee()) return;
    render(); status.textContent = `${copy.added} ${formatAmount(example.amount)}.`;
  });
  reset.addEventListener('click', () => {
    if (!example.reset()) return;
    render(); status.textContent = `${copy.restored} ${formatAmount(example.amount)}.`;
  });
  render(); controls.hidden = false; fallback.hidden = true;
}
if (typeof document !== 'undefined') document.querySelectorAll('[data-example]').forEach(initExample);
