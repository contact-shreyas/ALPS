import { useEffect, useState } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface KPIData {
  id: string;
  label: string;
  value: number;
  trend: number;
  unit?: string;
  type: 'hotspots' | 'coverage' | 'processingTime';
}

export function KPIOverviewPanel() {
  const [kpis, setKpis] = useState<KPIData[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const fetchKPIs = async () => {
      try {
        const response = await fetch('/api/metrics/kpi');
        if (!response.ok) throw new Error('Failed to fetch KPIs');
        const data = await response.json();
        setKpis(data);
      } catch (error) {
        console.error('Error fetching KPIs:', error);
        // Set fallback data on error
        setKpis([
          {
            id: 'hotspots',
            label: 'Active Hotspots',
            value: 3,
            trend: 0,
            type: 'hotspots'
          },
          {
            id: 'coverage',
            label: 'Data Coverage',
            value: 85.5,
            trend: 2.5,
            type: 'coverage'
          },
          {
            id: 'processingTime',
            label: 'Processing Time',
            value: 1.25,
            trend: -5.2,
            type: 'processingTime'
          }
        ]);
      }
    };

    fetchKPIs();
    const interval = setInterval(fetchKPIs, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const formatValue = (value: number, type: string) => {
    switch (type) {
      case 'processingTime':
        return `${value.toFixed(2)}s`;
      case 'coverage':
        return `${value.toFixed(1)}%`;
      case 'hotspots':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-500';
    if (trend < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUpIcon className="w-4 h-4" />;
    if (trend < 0) return <ArrowDownIcon className="w-4 h-4" />;
    return null;
  };

  if (!isMounted || !kpis.length) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Key Performance Indicators
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg h-20"></div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg h-20"></div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg h-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Key Performance Indicators
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {kpi.label}
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatValue(kpi.value, kpi.type)}
              </p>
              <div className={`flex items-center ${getTrendColor(kpi.trend)}`}>
                {getTrendIcon(kpi.trend)}
                <span className="text-sm ml-1">
                  {Math.abs(kpi.trend)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}