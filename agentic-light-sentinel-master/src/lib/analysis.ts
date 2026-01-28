// src/lib/analysis.ts
// Lightweight hotspot detection utilities used by tests and demo flows.

export type SeriesPoint = { code: string; value: number };
export type Hotspot = {
  code: string;
  value: number;
  quantile: number; // 0..1 empirical percentile
  severity: "low" | "med" | "high" | "extreme";
};

function quantile(values: number[], q: number): number {
  if (!values.length) return NaN;
  const a = [...values].sort((x, y) => x - y);
  const pos = (a.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (a[base + 1] !== undefined) return a[base] + rest * (a[base + 1] - a[base]);
  return a[base];
}

function percentileRank(sortedAsc: number[], v: number): number {
  if (!sortedAsc.length) return 0;
  let lo = 0, hi = sortedAsc.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (sortedAsc[mid] <= v) lo = mid + 1; else hi = mid;
  }
  return Math.min(1, Math.max(0, lo / sortedAsc.length));
}

export function detectHotspots(points: SeriesPoint[], opts?: { topQuantile?: number }): Hotspot[] {
  if (!Array.isArray(points) || points.length === 0) return [];
  const q = opts?.topQuantile ?? 0.75; // top quartile by default
  const values = points.map(p => p.value);
  const thr = quantile(values, q);
  const sorted = [...values].sort((a, b) => a - b);

  const flagged = points
    .filter(p => p.value >= thr)
    .map<Hotspot>(p => {
      const pr = percentileRank(sorted, p.value); // empirical CDF
      const severity: Hotspot["severity"] =
        pr >= 0.97 ? "extreme" : pr >= 0.90 ? "high" : pr >= 0.80 ? "med" : "low";
      return { code: p.code, value: p.value, quantile: pr, severity };
    })
    // stable order: biggest first to look nice in UIs
    .sort((a, b) => b.value - a.value);

  return flagged;
}

// Simple rule example retained for reference:
// if (currentRadiance > 2 * avgLast30) { /* hard spike */ }
// For the demo we bias sensitivity; use detectHotspots + topQuantile=0.70 if needed.
