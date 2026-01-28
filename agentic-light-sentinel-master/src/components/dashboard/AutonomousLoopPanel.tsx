'use client';

import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useDashboard } from '../dashboard/insights/DashboardContext';
import { TimeDisplay } from '@/components/ui/TimeDisplay';

type ComponentStatus = 'running' | 'error' | 'success';

export function AutonomousLoopPanel() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg p-6 h-48" />;
  }

  const getStatusIcon = (status: 'idle' | 'running' | 'error' | 'done') => {
    switch (status) {
      case 'running':
        return <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />;
      case 'done':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-2 h-2 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusText = (type: 'sense' | 'reason' | 'act') => {
    if (!data?.autonomousLoop) return 'No data';
    const component = data.autonomousLoop[type];

    if (component.status === 'running') return 'Running...';
    if (component.status === 'error') return `Error (${component.errorCount} errors)`;
    if (type === 'act') {
      return `Queue: ${component.queueLength} items`;
    }
    return component.lastRun 
      ? <>Last run: <TimeDisplay timestamp={component.lastRun} /></>
      : 'Waiting...';
  };

  const status: LoopStatus = {
    sense: data?.autonomousLoop?.sense?.status === 'running' ? 'running' 
          : data?.autonomousLoop?.sense?.status === 'error' ? 'error' 
          : data?.autonomousLoop?.sense?.lastRun ? 'done' : 'idle',
    reason: data?.autonomousLoop?.reason?.status === 'running' ? 'running'
          : data?.autonomousLoop?.reason?.status === 'error' ? 'error'
          : data?.autonomousLoop?.reason?.lastRun ? 'done' : 'idle',
    act: data?.autonomousLoop?.act?.status === 'running' ? 'running'
          : data?.autonomousLoop?.act?.status === 'error' ? 'error'
          : data?.autonomousLoop?.act?.lastAction ? 'done' : 'idle'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Autonomous Loop</h3>
      
      <div className="grid grid-cols-3 gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            {getStatusIcon(status.sense)}
            <h4 className="font-medium">Sense</h4>
          </div>
          <p className="text-sm text-gray-500">{getStatusText('sense')}</p>
        </div>
        
        <div>
          <div className="flex items-center space-x-2 mb-2">
            {getStatusIcon(status.reason)}
            <h4 className="font-medium">Reason</h4>
          </div>
          <p className="text-sm text-gray-500">{getStatusText('reason')}</p>
        </div>
        
        <div>
          <div className="flex items-center space-x-2 mb-2">
            {getStatusIcon(status.act)}
            <h4 className="font-medium">Act</h4>
          </div>
          <p className="text-sm text-gray-500">{getStatusText('act')}</p>
        </div>
      </div>
    </div>
  );

  const status: LoopStatus = {
    sense: data?.autonomousLoop?.sense?.status === 'running' ? 'running' 
          : data?.autonomousLoop?.sense?.status === 'error' ? 'error' 
          : data?.autonomousLoop?.sense?.lastRun ? 'done' : 'idle',
    reason: data?.autonomousLoop?.reason?.status === 'running' ? 'running'
          : data?.autonomousLoop?.reason?.status === 'error' ? 'error'
          : data?.autonomousLoop?.reason?.lastRun ? 'done' : 'idle',
    act: data?.autonomousLoop?.act?.status === 'running' ? 'running'
          : data?.autonomousLoop?.act?.status === 'error' ? 'error'
          : data?.autonomousLoop?.act?.lastAction ? 'done' : 'idle'
  };

  useEffect(() => {
    const interval = setInterval(fetchStatus, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: 'idle' | 'running' | 'error' | 'done') => {
    switch (status) {
      case 'running':
        return <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />;
      case 'done':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-2 h-2 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusText = (status: 'idle' | 'running' | 'error' | 'done') => {
    switch (status) {
      case 'running':
        return 'Running';
      case 'done':
        return 'Complete';
      case 'error':
        return 'Error';
      default:
        return 'Idle';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Autonomous Loop</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sense</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.sense)}
              <span className="text-sm text-gray-600 dark:text-gray-400">{getStatusText(status.sense)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reason</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.reason)}
              <span className="text-sm text-gray-600 dark:text-gray-400">{getStatusText(status.reason)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Act</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.act)}
              <span className="text-sm text-gray-600 dark:text-gray-400">{getStatusText(status.act)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Queue</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{queueSize} items</span>
          </div>
        </div>
      </div>
      {lastUpdate && (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Last updated: {new Date(lastUpdate).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}