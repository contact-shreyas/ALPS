export function yyyyMmDd(d: Date) { return d.toISOString().slice(0, 10); }
export function isIsoDate(s: string) { return /^\d{4}-\d{2}-\d{2}$/.test(s); }
