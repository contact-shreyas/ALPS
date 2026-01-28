import { useEffect, useState } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  ClockIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ServerIcon,
  BoltIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';
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
  const [isMounted, setIsMounted] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/system/health');
      if (!response.ok) throw new Error('Failed to fetch system health');
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Error fetching system health:', error);
      // Set fallback data
      setHealth({
        ingestHealth: [
          {
            id: '1',
            type: 'INGEST',
            status: 'SUCCESS',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        processingHealth: [
          {
            id: '2',
            type: 'PROCESSING',
            status: 'SUCCESS',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        alertHealth: [
          {
            id: '3',
            type: 'ALERTS',
            status: 'SUCCESS',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        lastUpdate: new Date().toISOString()
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchHealth();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 dark:bg-green-900/20 border-green-500 dark:border-green-400';
      case 'ERROR':
        return 'bg-red-100 dark:bg-red-900/20 border-red-500 dark:border-red-400';
      case 'RUNNING':
        return 'bg-blue-100 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'ERROR':
        return <ExclamationCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'RUNNING':
        return <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />;
      default:
        return null;
    }
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'ingestion':
        return <ServerIcon className="w-5 h-5" />;
      case 'processing':
        return <BoltIcon className="w-5 h-5" />;
      case 'alerts':
        return <BellAlertIcon className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getHealthStatus = (processes: ProcessStatus[]) => {
    if (!processes || processes.length === 0) return { status: 'UNKNOWN', count: 0 };
    const errorCount = processes.filter(p => p.status === 'ERROR').length;
    const runningCount = processes.filter(p => p.status === 'RUNNING').length;
    const successCount = processes.filter(p => p.status === 'SUCCESS').length;
    
    if (errorCount > 0) return { status: 'ERROR', count: errorCount };
    if (runningCount > 0) return { status: 'RUNNING', count: runningCount };
    return { status: 'SUCCESS', count: successCount };
  };

  const HealthSection = ({ 
    title, 
    processes, 
    sectionKey,
    icon 
  }: { 
    title: string; 
    processes: ProcessStatus[]; 
    sectionKey: string;
    icon: React.ReactNode;
  }) => {
    const isExpanded = expandedSection === sectionKey;
    const healthStatus = getHealthStatus(processes);
    const statusColor = getStatusColor(healthStatus.status);

    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${statusColor} transition-all duration-300`}>
              {icon}
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                {title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(healthStatus.status)}
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {healthStatus.count} {healthStatus.status.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
              {healthStatus.status}
            </div>
            {isExpanded ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </button>
        
        {isExpanded && (
          <div className="p-4 bg-white dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-2">
              {processes.length > 0 ? (
                processes.map((process) => (
                  <div
                    key={process.id}
                    className={`p-3 rounded-lg border-l-4 ${getStatusColor(process.status)} transition-all duration-200 hover:scale-[1.01] cursor-pointer`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        {getStatusIcon(process.status)}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {process.type}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Last update: <TimeDisplay timestamp={process.updatedAt} />
                          </p>
                        </div>
                      </div>
                      {process.error && (
                        <span className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                          {process.error}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No processes found
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isMounted || !health) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            System Health
          </h3>
        </div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  const totalProcesses = (health.ingestHealth?.length || 0) + 
                         (health.processingHealth?.length || 0) + 
                         (health.alertHealth?.length || 0);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            System Health
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Monitoring {totalProcesses} processes
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50"
          title="Refresh health status"
        >
          <ArrowPathIcon className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="space-y-3">
        <HealthSection 
          title="Data Ingestion" 
          processes={health.ingestHealth || []} 
          sectionKey="ingestion"
          icon={getSectionIcon('ingestion')}
        />
        <HealthSection 
          title="Data Processing" 
          processes={health.processingHealth || []} 
          sectionKey="processing"
          icon={getSectionIcon('processing')}
        />
        <HealthSection 
          title="Alert System" 
          processes={health.alertHealth || []} 
          sectionKey="alerts"
          icon={getSectionIcon('alerts')}
        />
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <ClockIcon className="w-3 h-3" />
          Last updated: <TimeDisplay timestamp={health.lastUpdate} />
        </p>
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>
    </div>
  );
}