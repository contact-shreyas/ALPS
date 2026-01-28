'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Zap
} from 'lucide-react';

interface SystemStatus {
  health: 'healthy' | 'warning' | 'critical';
  uptime: string;
  lastUpdate: string;
  activeAlerts: number;
  processingLoad: number;
  responseTime: number;
}

export function StatusOverview() {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<SystemStatus>({
    health: 'healthy',
    uptime: '99.9%',
    lastUpdate: new Date().toISOString(),
    activeAlerts: 0,
    processingLoad: 45,
    responseTime: 250
  });

  useEffect(() => {
    setMounted(true);
    
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/system/status');
        if (!response.ok) throw new Error('Failed to fetch status');
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        console.error('Error fetching system status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {/* System Performance */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">Performance</h3>
          <Activity className="w-5 h-5 text-blue-500" />
        </div>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Processing Load</span>
              <span className="font-medium">{status.processingLoad}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${status.processingLoad}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Response Time</span>
              <span className="font-medium">{status.responseTime}ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts & Uptime */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">System Metrics</h3>
          <Server className="w-5 h-5 text-gray-500" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Zap className="w-4 h-4 text-yellow-500 mr-2" />
              <span className="text-sm text-gray-500">Active Alerts</span>
            </div>
            <span className="font-medium">{status.activeAlerts}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-green-500 mr-2" />
              <span className="text-sm text-gray-500">Uptime</span>
            </div>
            <span className="font-medium">{status.uptime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}