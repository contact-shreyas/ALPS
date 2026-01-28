'use client';

import { useDashboard } from './DashboardContext';
import { formatDistanceToNow } from 'date-fns';

export function ActivityStream() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg p-6 h-96" />;
  }

  if (!data?.alerts.recent.length) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      
      <div className="space-y-4">
        {data.alerts.recent.map(alert => (
          <div key={alert.id} className="flex items-start space-x-3">
            <div className={`
              h-2 w-2 mt-2 rounded-full flex-shrink-0
              ${alert.severity === 3 ? 'bg-red-500' : 
                alert.severity === 2 ? 'bg-yellow-500' : 
                'bg-blue-500'}
            `} />
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {alert.message}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{alert.level}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(alert.createdAt))} ago</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {data.alerts.recent.length > 0 && (
        <div className="mt-4 text-center">
          <button 
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            View all activity
          </button>
        </div>
      )}
    </div>
  );
}