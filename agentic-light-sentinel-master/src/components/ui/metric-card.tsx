"use client";

import { InfoIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { SystemMetric } from "../../types/system-health";
import { cn } from "../../lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

interface MetricCardProps {
  label: string;
  metric: SystemMetric;
  tooltip?: string;
  formatValue?: (value: number) => string;
  className?: string;
}

export function MetricCard({
  label,
  metric,
  tooltip,
  formatValue = (value) => `${value.toFixed(1)}%`,
  className
}: MetricCardProps) {
  const hasData = metric.value !== undefined;
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'border-green-200 dark:border-green-800';
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-800';
      case 'critical':
        return 'border-red-200 dark:border-red-800';
      default:
        return 'border-gray-200 dark:border-gray-800';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={cn(
      "p-4 rounded-lg border bg-white dark:bg-gray-800",
      "transition-all duration-200",
      getStatusColor(metric.status),
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</h3>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="w-3.5 h-3.5 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="text-xs text-gray-400">
          {new Date(metric.lastUpdated).toLocaleTimeString('en-US', { hour12: false })}
        </div>
      </div>
      
      <div className="flex items-end gap-2">
        <div className="text-2xl font-semibold">
          {hasData ? formatValue(metric.value) : "Awaiting Data"}
        </div>
        
        {metric.trend && metric.trend !== 'stable' && (
          <div className={cn(
            "flex items-center text-sm",
            metric.trend === 'up' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )}>
            {metric.trend === 'up' ? (
              <TrendingUpIcon className="w-4 h-4 mr-0.5" />
            ) : (
              <TrendingDownIcon className="w-4 h-4 mr-0.5" />
            )}
            {metric.previousValue && (
              <span className="text-xs ml-0.5">
                ({((metric.value - metric.previousValue) / metric.previousValue * 100).toFixed(1)}%)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Add a subtle loading animation when value updates */}
      <div className="relative mt-2 h-1 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
        <div className={cn(
          "absolute inset-y-0 left-0 transition-all duration-500",
          getProgressColor(metric.status)
        )} style={{ width: `${hasData ? Math.min(metric.value, 100) : 0}%` }} />
      </div>
    </div>
  );
}