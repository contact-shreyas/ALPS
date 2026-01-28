'use client';

import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useDashboard } from '@/components/dashboard/insights/DashboardContext';
import { TimeDisplay } from '@/components/ui/TimeDisplay';

type ComponentData = {
  autonomousLoop: {
    sense: {
      status: 'error' | 'success' | 'running';
      lastRun: string | null;
      errorCount: number;
    };
    reason: {
      status: 'error' | 'success' | 'running';
      lastRun: string | null;
      errorCount: number;
    };
    act: {
      status: 'error' | 'success' | 'running';
      queueLength: number;
      lastAction: string | null;
    };
  };
};

export function AutonomousLoopCard() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg p-6 h-48" />;
  }

  const getStatusIcon = (component: 'sense' | 'reason' | 'act') => {
    const status = data?.autonomousLoop?.[component]?.status;
    
    if (status === 'running') {
      return (
        <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      );
    }
    if (status === 'error') {
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    }
    if (status === 'success') {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
    return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
  };

  const getData = (type: 'sense' | 'reason' | 'act') => {
    return data?.autonomousLoop?.[type];
  };

  const getStatusText = (type: 'sense' | 'reason' | 'act') => {
    const component = getData(type);
    if (!component) return 'No data';

    if (component.status === 'running') return 'Running...';
    if (component.status === 'error') {
      if (type === 'sense' || type === 'reason') {
        return `Error (${(component as any).errorCount} errors)`;
      } else {
        return 'Error';
      }
    }

    if (type === 'act') {
      return `Queue: ${(component as any).queueLength} items`;
    }

    if (type === 'sense' || type === 'reason') {
      const lastRun = (component as any).lastRun;
      if (lastRun) {
        return (
          <>
            Last run: <TimeDisplay timestamp={lastRun} />
          </>
        );
      }
    }

    return 'Waiting...';
  };

  const renderComponent = (type: 'sense' | 'reason' | 'act') => {
    const component = getData(type);
    
    return (
      <div>
        <div className="flex items-center mb-2">
          <div className="mr-2">
            {getStatusIcon(type)}
          </div>
          <h4 className="font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</h4>
        </div>
        <div className="text-sm text-gray-500">
          {getStatusText(type)}
        </div>
        {type !== 'act' && component?.status === 'error' && (component as any).errorCount > 0 && (
          <div className="mt-1 text-sm text-red-500">
            {(component as any).errorCount} errors
          </div>
        )}
        {type === 'act' && component?.status === 'success' && (component as any).lastAction && (
          <div className="mt-1 text-sm text-green-500">
            Last action: <TimeDisplay timestamp={(component as any).lastAction} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Autonomous Loop</h3>
      <div className="grid grid-cols-3 gap-6">
        {renderComponent('sense')}
        {renderComponent('reason')}
        {renderComponent('act')}
      </div>
    </div>
  );
}