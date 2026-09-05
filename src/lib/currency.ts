/**
 * Currency formatting utility.
 * BMC uses GBP (£), all other companies use USD ($).
 */

export function getCurrencySymbol(company: string): string {
  return company?.toUpperCase() === 'BME' ? '£' : '$';
}

export function getCurrencyCode(company: string): string {
  return company?.toUpperCase() === 'BME' ? 'GBP' : 'USD';
}

export function formatCurrency(
  value: number | null | undefined,
  company: string,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  if (value == null) return '-';
  const symbol = getCurrencySymbol(company);
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  });
  return `${symbol}${formatted}`;
}
