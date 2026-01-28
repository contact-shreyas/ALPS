/**
 * Real-time monitoring dashboard component
 */

'use client';

import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
// Format bytes utility function
const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MonitoringData {
  timestamp: number;
  system: {
    memory: number;
    cpu: number;
    uptime: number;
  };
  cache: {
    size: number;
    hitRate: number;
  };
  api: {
    activeRequests: number;
    averageResponseTime: number;
    errorRate: number;
  };
  database: {
    connections: number;
    queryTime: number;
  };
}

interface Alert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<MonitoringData | null>(null);
  const [history, setHistory] = useState<MonitoringData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3000/api/ws/monitoring`);
    
    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'initial') {
          setMetrics(message.data);
          // Fetch history
          fetchHistory();
        } else if (message.type === 'update') {
          setMetrics(message.data);
          setHistory(prev => [...prev.slice(-59), message.data]); // Keep last 60 points
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/monitoring/history?minutes=60');
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch monitoring history:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/monitoring/alerts');
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Check alerts every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getChartData = (key: string, label: string, color: string) => {
    const labels = history.map(m => new Date(m.timestamp).toLocaleTimeString('en-US', { hour12: false }));
    const data = history.map(m => {
      const keys = key.split('.');
      let value: any = m;
      keys.forEach(k => value = value[k]);
      return value;
    });

    return {
      labels,
      datasets: [
        {
          label,
          data,
          borderColor: color,
          backgroundColor: color + '20',
          tension: 0.1,
        },
      ],
    };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Connecting to monitoring system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold">System Monitoring</h2>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Active Alerts</h3>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-md ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium">{alert.message}</span>
                  <span className="text-sm opacity-75">
                    {new Date(alert.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Memory Usage</h3>
          <p className="text-2xl font-bold">{formatBytes(metrics.system.memory)}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Cache Hit Rate</h3>
          <p className="text-2xl font-bold">{(metrics.cache.hitRate * 100).toFixed(1)}%</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Avg Response Time</h3>
          <p className="text-2xl font-bold">{metrics.api.averageResponseTime.toFixed(0)}ms</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Error Rate</h3>
          <p className="text-2xl font-bold">{(metrics.api.errorRate * 100).toFixed(2)}%</p>
        </div>
      </div>

      {/* Charts */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Memory Usage</h3>
            <Line 
              data={getChartData('system.memory', 'Memory (bytes)', '#3B82F6')}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => formatBytes(Number(value)),
                    },
                  },
                },
              }}
            />
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Response Time</h3>
            <Line 
              data={getChartData('api.averageResponseTime', 'Response Time (ms)', '#EF4444')}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Cache Performance</h3>
            <Line 
              data={getChartData('cache.hitRate', 'Hit Rate', '#10B981')}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 1,
                    ticks: {
                      callback: (value) => (Number(value) * 100).toFixed(0) + '%',
                    },
                  },
                },
              }}
            />
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Database Query Time</h3>
            <Line 
              data={getChartData('database.queryTime', 'Query Time (ms)', '#8B5CF6')}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* System Information */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Uptime</span>
            <p className="text-lg">{Math.floor(metrics.system.uptime / 3600)}h {Math.floor((metrics.system.uptime % 3600) / 60)}m</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Active Requests</span>
            <p className="text-lg">{metrics.api.activeRequests}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">DB Connections</span>
            <p className="text-lg">{metrics.database.connections}</p>
          </div>
        </div>
      </div>
    </div>
  );
}