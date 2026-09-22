export const formatAmount = (amount) => `Rp${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(amount)}`;
export function createExample(initialAmount, expenseAmount) {
  if (!Number.isSafeInteger(initialAmount) || !Number.isSafeInteger(expenseAmount) || expenseAmount <= 0 || initialAmount < expenseAmount) throw new Error('Invalid example amounts');
  let spent = false;
  return {
    spend() { const changed = !spent; spent = true; return changed; },
    reset() { const changed = spent; spent = false; return changed; },
    get spent() { return spent; },
    get amount() { return initialAmount - (spent ? expenseAmount : 0); },
    get fraction() { return this.amount / initialAmount; },
  };
}
