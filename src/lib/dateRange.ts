export interface DateRangeOption {
  label: string;
  days: number | null; // null = all time
}

export const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  { label: 'Today',       days: 0 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 14 days', days: 14 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'All time',    days: null },
];

export const DEFAULT_RANGE = DATE_RANGE_OPTIONS[3]; // Last 30 days

/** Returns ISO date string for `days` ago, or null for all time. */
export function getStartDate(days: number | null): string | null {
  if (days === null) return null;
  const d = new Date();
  if (days === 0) {
    // Today: midnight local time
    d.setHours(0, 0, 0, 0);
  } else {
    d.setDate(d.getDate() - days);
    d.setHours(0, 0, 0, 0);
  }
  return d.toISOString();
}
