export const formatAmount = (amount) => `Rp${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(amount)}`;
export function createExample(initialAmount, expenseAmount, coffeeAmount = 0) {
  if (!Number.isSafeInteger(initialAmount) || !Number.isSafeInteger(expenseAmount) || expenseAmount <= 0 || initialAmount < expenseAmount) throw new Error('Invalid example amounts');
  if (!Number.isSafeInteger(coffeeAmount) || coffeeAmount < 0 || expenseAmount + coffeeAmount > initialAmount) throw new Error('Invalid coffee amount');
  let spent = false, coffeeSpent = false;
  return {
    spend() { const changed = !spent; spent = true; return changed; },
    coffee() { if (!coffeeAmount || coffeeSpent) return false; coffeeSpent = true; return true; },
    reset() { const changed = spent || coffeeSpent; spent = false; coffeeSpent = false; return changed; },
    get coffeeSpent() { return coffeeSpent; },
    get spent() { return spent; },
    get amount() { return initialAmount - (spent ? expenseAmount : 0) - (coffeeSpent ? coffeeAmount : 0); },
    get fraction() { return this.amount / initialAmount; },
  };
}
