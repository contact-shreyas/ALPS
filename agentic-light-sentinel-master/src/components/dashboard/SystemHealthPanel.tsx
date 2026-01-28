import { useEffect, useState } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { TimeDisplay } from '@/components/ui/TimeDisplay';

interface ProcessStatus {
  id: string;
  type: string;
  status: 'RUNNING' | 'SUCCESS' | 'ERROR';
  error?: string;
  createdAt: string;
  updatedAt: string;
}

interface SystemHealth {
  ingestHealth: ProcessStatus[];
  processingHealth: ProcessStatus[];
  alertHealth: ProcessStatus[];
  lastUpdate: string;
}

export function SystemHealthPanel() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/system/health');
        if (!response.ok) throw new Error('Failed to fetch system health');
        const data = await response.json();
        setHealth(data);
      } catch (error) {
        console.error('Error fetching system health:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'ERROR':
        return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />;
      case 'RUNNING':
        return <ClockIcon className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const formatTime = (dateString: string) => {
    return <TimeDisplay timestamp={dateString} />;
  };

  const ProcessList = ({ processes, title }: { processes: ProcessStatus[], title: string }) => (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h4>
      <div className="space-y-1">
        {processes.map((process) => (
          <div
            key={process.id}
            className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-2">
              {getStatusIcon(process.status)}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {process.type}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last update: {formatTime(process.updatedAt)}
                </p>
              </div>
            </div>
            {process.error && (
              <span className="text-xs text-red-500 dark:text-red-400">
                {process.error}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (!isMounted || !health) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          System Health
        </h3>
        <div className="space-y-3">
          <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        System Health
      </h3>
      <div className="space-y-4">
        <ProcessList processes={health.ingestHealth} title="Data Ingestion" />
        <ProcessList processes={health.processingHealth} title="Data Processing" />
        <ProcessList processes={health.alertHealth} title="Alert System" />
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Last updated: {formatTime(health.lastUpdate)}
        </p>
      </div>
    </div>
  );
}