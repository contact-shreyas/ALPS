/**
 * Calculate the percentage change between two numbers
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Number(((current - previous) / previous * 100).toFixed(1));
}

/**
 * Format a large number with K/M/B suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

/**
 * Calculate severity level based on metrics
 */
export function calculateSeverityLevel(value: number, threshold: number): 'low' | 'medium' | 'high' {
  if (value >= threshold * 1.5) return 'high';
  if (value >= threshold) return 'medium';
  return 'low';
}

/**
 * Format duration in minutes to human readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Get color class based on trend
 */
export function getTrendColorClass(trend: number): string {
  if (trend > 0) return 'text-green-600 dark:text-green-400';
  if (trend < 0) return 'text-red-600 dark:text-red-400';
  return 'text-blue-600 dark:text-blue-400';
}

/**
 * Get background color class based on trend
 */
export function getTrendBgClass(trend: number): string {
  if (trend > 0) return 'bg-green-100 dark:bg-green-900/20';
  if (trend < 0) return 'bg-red-100 dark:bg-red-900/20';
  return 'bg-blue-100 dark:bg-blue-900/20';
}