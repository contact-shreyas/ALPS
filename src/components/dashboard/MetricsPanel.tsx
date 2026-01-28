import { useEffect, useState } from "react";
import { ChartBarIcon, ClockIcon, MapIcon } from "@heroicons/react/24/outline";
import { TimeDisplay } from "../ui/TimeDisplay";

type MetricSummary = {
  precision: number;
  recall: number;
  ingestAlertP50: number;
  ingestAlertP95: number;
  coverage: { percentage: number };
  avgRadiance?: number;
  maxRadiance?: number;
  timestamp?: string;
};

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  unit = "", 
  trend = 0,
  delay = 0
}: { 
  title: string; 
  value: number; 
  icon: typeof ChartBarIcon;
  unit?: string;
  trend?: number;
  delay?: number;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 transition-colors duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {value.toFixed(1)}{unit}
            </p>
            {trend !== 0 && (
              <span className={`text-sm font-medium ${
                trend > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}>
                {trend > 0 ? "+" : ""}{trend}%
              </span>
            )}
          </div>
        </div>
        <div className={`rounded-full p-2 ${
          trend > 0 ? "bg-green-100 dark:bg-green-900/20" : 
          trend < 0 ? "bg-red-100 dark:bg-red-900/20" : 
          "bg-blue-100 dark:bg-blue-900/20"
        }`}>
          <Icon className={`w-5 h-5 ${
            trend > 0 ? "text-green-600 dark:text-green-400" : 
            trend < 0 ? "text-red-600 dark:text-red-400" : 
            "text-blue-600 dark:text-blue-400"
          }`} />
        </div>
      </div>
    </div>
  );
}

export function MetricsPanel({ metrics }: { metrics?: MetricSummary }) {
  if (!metrics) {
    return (
      <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 mb-4 transition-colors duration-200 shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Calculate health score (0-100)
  const healthScore = Math.round(
    ((metrics.precision || 0) * 0.3 + 
     (metrics.recall || 0) * 0.3 + 
     (metrics.coverage?.percentage || 0) * 0.4) * 100
  );

  const healthStatus = 
    healthScore >= 80 ? 'Excellent' :
    healthScore >= 60 ? 'Good' :
    healthScore >= 40 ? 'Fair' :
    'Needs Attention';

  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 mb-4 transition-colors duration-200 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">System Health</h3>
          <div className="mt-1 flex items-center gap-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{healthScore}</div>
            <div className={`text-sm font-medium ${
              healthScore >= 80 ? 'text-green-600 dark:text-green-400' :
              healthScore >= 60 ? 'text-blue-600 dark:text-blue-400' :
              healthScore >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {healthStatus}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-400 mr-1 animate-pulse"></span>
              Live
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Last update: {metrics.timestamp ? <TimeDisplay timestamp={metrics.timestamp} /> : 'N/A'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Detection Metrics */}
        <MetricCard
          title="Detection Precision"
          value={(metrics.precision || 0) * 100}
          icon={ChartBarIcon}
          unit="%"
          trend={(metrics.precision || 0) > 0.85 ? 5 : (metrics.precision || 0) < 0.7 ? -5 : 0}
          delay={0}
        />
        <MetricCard
          title="Detection Recall"
          value={(metrics.recall || 0) * 100}
          icon={ChartBarIcon}
          unit="%"
          trend={(metrics.recall || 0) > 0.85 ? 5 : (metrics.recall || 0) < 0.7 ? -5 : 0}
          delay={100}
        />
        <MetricCard
          title="Coverage"
          value={(metrics.coverage?.percentage || 0)}
          icon={MapIcon}
          unit="%"
          trend={(metrics.coverage?.percentage || 0) > 90 ? 5 : (metrics.coverage?.percentage || 0) < 80 ? -5 : 0}
          delay={200}
        />
        <MetricCard
          title="Response Time"
          value={metrics.ingestAlertP50 || 0}
          icon={ClockIcon}
          unit="m"
          trend={(metrics.ingestAlertP50 || 0) < 10 ? 5 : (metrics.ingestAlertP50 || 0) > 20 ? -5 : 0}
          delay={300}
        />
      </div>

      {/* Performance Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Response Times</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Median (P50)</span>
              <span className="font-medium">{(metrics.ingestAlertP50 || 0).toFixed(1)}m</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">95th Percentile</span>
              <span className="font-medium">{(metrics.ingestAlertP95 || 0).toFixed(1)}m</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
              <div 
                className="bg-blue-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min(100, ((metrics.ingestAlertP50 || 0) / 20) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Radiance Levels</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Average</span>
              <span className="font-medium">{(metrics.avgRadiance || 0).toFixed(1)} nW/cm²/sr</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Peak</span>
              <span className="font-medium">{(metrics.maxRadiance || 0).toFixed(1)} nW/cm²/sr</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
              <div 
                className={`h-1.5 rounded-full ${
                  (metrics.maxRadiance || 0) > 100 ? 'bg-red-500' : 
                  (metrics.maxRadiance || 0) > 50 ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, (metrics.avgRadiance || 0) / 2)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">System Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Detection Health</span>
            <span className={`font-medium ${
              (metrics.precision || 0) > 0.8 && (metrics.recall || 0) > 0.8 
                ? 'text-green-600 dark:text-green-400'
                : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              {(metrics.precision || 0) > 0.8 && (metrics.recall || 0) > 0.8 ? 'Optimal' : 'Need Tuning'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Coverage Status</span>
            <span className={`font-medium ${
              (metrics.coverage?.percentage || 0) > 90 
                ? 'text-green-600 dark:text-green-400'
                : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              {(metrics.coverage?.percentage || 0) > 90 ? 'Complete' : 'Partial'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Response Status</span>
            <span className={`font-medium ${
              (metrics.ingestAlertP95 || 0) < 15
                ? 'text-green-600 dark:text-green-400'
                : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              {(metrics.ingestAlertP95 || 0) < 15 ? 'Fast' : 'Delayed'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
