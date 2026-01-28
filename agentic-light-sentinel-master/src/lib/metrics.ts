export type MetricsResult = {
  hotspotPrecision: number;
  hotspotRecall: number;
  ingestAlertP50: number;
  ingestAlertP95: number;
  districtCoverage: number;
};

export function calculateProcessingTimes(alerts: { createdAt: Date; detectedAt: Date }[]): number[] {
  // Filter out invalid dates and negative processing times
  return alerts
    .filter(alert => alert.createdAt && alert.detectedAt)
    .map(alert => {
      const processingTime = alert.createdAt.getTime() - alert.detectedAt.getTime();
      return Math.max(0, processingTime); // Ensure non-negative processing time
    })
    .sort((a, b) => a - b);
}

export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const index = Math.floor(values.length * (percentile / 100));
  return values[index];
}

export function calculateCoverageMetrics(
  districtsWithData: number,
  totalDistricts: number
): number {
  // Ensure we don't divide by zero and result is within valid range
  if (totalDistricts <= 0) return 0;
  const coverage = (districtsWithData / totalDistricts) * 100;
  return Math.min(100, Math.max(0, coverage));
}

export function calculateHotspotMetrics(
  confirmedHotspots: number,
  totalAlerts: number,
  missedHotspots: number
): { precision: number; recall: number } {
  // Ensure we don't divide by zero and handle edge cases
  const precision = totalAlerts > 0 ? (confirmedHotspots / totalAlerts) * 100 : 0;
  const totalPossibleHotspots = confirmedHotspots + missedHotspots;
  const recall = totalPossibleHotspots > 0 ? (confirmedHotspots / totalPossibleHotspots) * 100 : 0;

  // Ensure results are within valid range (0-100)
  return {
    precision: Math.min(100, Math.max(0, precision)),
    recall: Math.min(100, Math.max(0, recall))
  };
}