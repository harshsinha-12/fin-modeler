/**
 * Utility functions for date and number formatting
 */

/**
 * Add months to a YYYY-MM formatted date string
 */
export function addMonths(startMonth: string, monthsToAdd: number): string {
  const [year, month] = startMonth.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  date.setMonth(date.getMonth() + monthsToAdd);
  return formatMonth(date);
}

/**
 * Format a date as YYYY-MM
 */
export function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Parse YYYY-MM string to Date
 */
export function parseMonth(monthString: string): Date {
  const [year, month] = monthString.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

/**
 * Get month difference between two YYYY-MM strings
 */
export function getMonthDifference(start: string, end: string): number {
  const startDate = parseMonth(start);
  const endDate = parseMonth(end);

  return (
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth())
  );
}

/**
 * Format currency with appropriate decimals
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  compact: boolean = false
): string {
  if (compact && Math.abs(amount) >= 1000) {
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? "-" : "";
    if (absAmount >= 1000000) {
      return `${sign}$${(absAmount / 1000000).toFixed(1)}M`;
    }
    return `${sign}$${(absAmount / 1000).toFixed(1)}K`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with K/M suffix
 */
export function formatNumber(num: number): string {
  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (absNum >= 1000000) {
    return `${sign}${(absNum / 1000000).toFixed(1)}M`;
  }
  if (absNum >= 1000) {
    return `${sign}${(absNum / 1000).toFixed(1)}K`;
  }
  return `${sign}${absNum.toFixed(0)}`;
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(
  oldValue: number,
  newValue: number
): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round to specified decimal places
 */
export function round(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}
