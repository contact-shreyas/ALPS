'use client';

import { useDashboard } from './DashboardContext';

export function MetricsCard() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg p-6 h-48" />;
  }

  // Defensive: data or metrics may be undefined during initial loads or errors
  const metrics = data?.metrics;

  if (!metrics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
        <div className="text-sm text-gray-500">Metrics are not available.</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500">Average Latency</p>
          <p className="text-2xl font-bold">{metrics.processing.avgLatencyMs.toFixed(0)}ms</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Success Rate</p>
          <p className="text-2xl font-bold">{metrics.processing.successRate.toFixed(1)}%</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">24h Hotspots</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold">{metrics.hotspots.last24h}</p>
            <p className={`text-sm ${metrics.hotspots.trend > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {metrics.hotspots.trend > 0 ? '+' : ''}{metrics.hotspots.trend.toFixed(1)}%
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500">Coverage</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold">{metrics.coverage.percentage.toFixed(1)}%</p>
            <p className="text-xs text-gray-400">
              {new Date(metrics.coverage.lastUpdate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}