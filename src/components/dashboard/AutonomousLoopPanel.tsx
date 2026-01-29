'use client';

import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useDashboard } from '../dashboard/insights/DashboardContext';
import { TimeDisplay } from '@/components/ui/TimeDisplay';

type LoopStatus = 'idle' | 'running' | 'done' | 'error';

interface LoopStatusData {
  sense: LoopStatus;
  reason: LoopStatus;
  act: LoopStatus;
}

export function AutonomousLoopPanel() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg p-6 h-48" />;
  }

  const getStatusIcon = (status: LoopStatus) => {
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

  const getStatusText = (type: 'sense' | 'reason' | 'act'): string | JSX.Element => {
    if (!data?.autonomousLoop) return 'No data';
    const component = data.autonomousLoop[type];

    if (!component) return 'Unknown';
    if (component.status === 'running') return 'Running...';
    if (component.status === 'error') {
      const errorCount = 'errorCount' in component ? component.errorCount : 0;
      return `Error (${errorCount} errors)`;
    }
    if (type === 'act') {
      const queueLength = 'queueLength' in component ? component.queueLength : 0;
      return `Queue: ${queueLength} items`;
    }
    if ('lastRun' in component && component.lastRun) {
      return <>Last run: <TimeDisplay timestamp={component.lastRun} /></>;
    }
    return 'Waiting...';
  };

  const status: LoopStatusData = {
    sense: (data?.autonomousLoop?.sense?.status === 'running' ? 'running' 
            : data?.autonomousLoop?.sense?.status === 'error' ? 'error' 
            : data?.autonomousLoop?.sense?.lastRun ? 'done' : 'idle') as LoopStatus,
    reason: (data?.autonomousLoop?.reason?.status === 'running' ? 'running'
            : data?.autonomousLoop?.reason?.status === 'error' ? 'error'
            : data?.autonomousLoop?.reason?.lastRun ? 'done' : 'idle') as LoopStatus,
    act: (data?.autonomousLoop?.act?.status === 'running' ? 'running'
          : data?.autonomousLoop?.act?.status === 'error' ? 'error'
          : data?.autonomousLoop?.act?.lastAction ? 'done' : 'idle') as LoopStatus
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
}