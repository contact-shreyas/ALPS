'use client';

import { useDashboard } from './DashboardContext';

export function AlertsCard() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg p-6 h-48" />;
  }

  const { active } = data!.alerts;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Active Alerts</h3>
      
      <div className="grid grid-cols-3 gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <p className="text-sm text-gray-500">High Priority</p>
          </div>
          <p className="text-2xl font-bold">{active.high}</p>
        </div>
        
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <p className="text-sm text-gray-500">Medium Priority</p>
          </div>
          <p className="text-2xl font-bold">{active.medium}</p>
        </div>
        
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <p className="text-sm text-gray-500">Low Priority</p>
          </div>
          <p className="text-2xl font-bold">{active.low}</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Total active alerts</span>
          <span className="font-medium">
            {active.high + active.medium + active.low}
          </span>
        </div>
        
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500"
            style={{
              width: '100%',
              background: `linear-gradient(to right, 
                #EF4444 0%, 
                #EF4444 ${(active.high / (active.high + active.medium + active.low)) * 100}%, 
                #F59E0B ${(active.high / (active.high + active.medium + active.low)) * 100}%, 
                #F59E0B ${((active.high + active.medium) / (active.high + active.medium + active.low)) * 100}%,
                #3B82F6 ${((active.high + active.medium) / (active.high + active.medium + active.low)) * 100}%, 
                #3B82F6 100%)`
            }}
          />
        </div>
      </div>
    </div>
  );
}