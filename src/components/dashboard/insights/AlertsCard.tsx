'use client';

import { useDashboard } from './DashboardContext';
import { useEffect, useState } from 'react';

export function AlertsCard() {
  const { data, isLoading } = useDashboard();
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toLocaleTimeString());
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Update timestamp every second
    const interval = setInterval(() => {
      setLastUpdate(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg p-6 h-48" />;
  }

  const { active } = data!.alerts;
  const total = active.high + active.medium + active.low;
  const highPercent = total > 0 ? (active.high / total) * 100 : 0;
  const mediumPercent = total > 0 ? (active.medium / total) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Active Alerts</h3>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-xs text-gray-500">Live • {lastUpdate}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <p className="text-sm text-gray-500">High Priority</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{active.high}</p>
          <p className="text-xs text-gray-400 mt-1">{highPercent.toFixed(1)}% of total</p>
        </div>
        
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <p className="text-sm text-gray-500">Medium Priority</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{active.medium}</p>
          <p className="text-xs text-gray-400 mt-1">{mediumPercent.toFixed(1)}% of total</p>
        </div>
        
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <p className="text-sm text-gray-500">Low Priority</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">{active.low}</p>
          <p className="text-xs text-gray-400 mt-1">{((total > 0 ? active.low / total : 0) * 100).toFixed(1)}% of total</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
          <span>Total active alerts</span>
          <span className={`font-bold text-lg ${total > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {total}
          </span>
        </div>
        
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-300"
            style={{
              width: total > 0 ? '100%' : '100%',
              background: total > 0 
                ? `linear-gradient(to right, 
                  #EF4444 0%, 
                  #EF4444 ${highPercent}%, 
                  #F59E0B ${highPercent}%, 
                  #F59E0B ${highPercent + mediumPercent}%,
                  #3B82F6 ${highPercent + mediumPercent}%, 
                  #3B82F6 100%)`
                : '#10B981'
            }}
          />
        </div>
      </div>

      {/* Real-time status indicator */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          {total === 0 ? '✓ All systems normal' : `⚠️ ${total} alert${total !== 1 ? 's' : ''} requiring attention`}
        </p>
      </div>
    </div>
  );
}