
export function formatCurrency(amount: number) {
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formattedAmount}`;
}
