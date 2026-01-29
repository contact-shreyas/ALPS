'use client';

import { useEffect, useState } from 'react';

interface Alert {
  id: string;
  code: string;
  level: number;
  severity: string;
  message: string;
  detectedAt: Date;
  confirmed: boolean;
}

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch('/api/alerts.json');
        if (response.ok) {
          const data = await response.json();
          setAlerts(data.alerts || []);
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white flex items-center justify-between">
        <span>Recent Alerts</span>
        {alerts.length > 0 && (
          <span className="text-xs font-normal bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-0.5 rounded-full">
            {alerts.length}
          </span>
        )}
      </h3>
      
      {loading ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">No active alerts</div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {alerts.slice(0, 10).map((alert) => (
            <div
              key={alert.id}
              className={`p-2 rounded text-xs border ${
                alert.severity === 'CRITICAL'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : alert.severity === 'HIGH'
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">{alert.code}</div>
                  <div className="text-gray-600 dark:text-gray-300 mt-0.5">{alert.message}</div>
                  <div className="text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(alert.detectedAt).toLocaleString()}
                  </div>
                </div>
                {alert.confirmed && (
                  <span className="ml-2 text-green-600 dark:text-green-400 text-xs">✓</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
