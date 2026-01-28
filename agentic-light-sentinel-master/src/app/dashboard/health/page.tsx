"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "../../../components/ui/metric-card";
import { SystemHealth, SystemHealthConfig } from "../../../types/system-health";
import { EventLog } from "../../../components/panels/EventLog";
import { ConfigurationDialog } from "../../../components/panels/ConfigurationDialog";

const DEFAULT_CONFIG: SystemHealthConfig = {
  thresholds: {
    precision: 80,
    coverage: 90,
    responseTime: 200
  },
  updateInterval: 30000,
  darkMode: false
};

export default function HealthDashboard() {
  const [healthData, setHealthData] = useState<SystemHealth | null>(null);
  const [isEventLogExpanded, setIsEventLogExpanded] = useState(false);
  const [config, setConfig] = useState<SystemHealthConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/system/health');
        const data = await response.json();
        setHealthData(data);
      } catch (error) {
        console.error('Error fetching health data:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (!healthData) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-96">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">System Health Dashboard</h1>
        <ConfigurationDialog config={config} onSave={setConfig} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          label="Detection Precision"
          metric={healthData.detectionPrecision}
          tooltip="Percentage of correct light pollution detections"
          formatValue={(value) => `${value.toFixed(1)}%`}
        />
        
        <MetricCard
          label="Detection Recall"
          metric={healthData.detectionRecall}
          tooltip="Percentage of light pollution incidents detected"
          formatValue={(value) => `${value.toFixed(1)}%`}
        />
        
        <MetricCard
          label="Coverage"
          metric={healthData.coverage}
          tooltip="Percentage of monitored area coverage"
          formatValue={(value) => `${value.toFixed(1)}%`}
        />
        
        <MetricCard
          label="Response Time"
          metric={healthData.responseTime}
          tooltip="Average response time in milliseconds"
          formatValue={(value) => `${value.toFixed(0)}ms`}
        />
        
        <div className="col-span-2">
          <div className="flex flex-col gap-4 h-full">
            <h2 className="text-lg font-semibold">System Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-white dark:bg-gray-800">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Issues</div>
                <div className="text-2xl font-bold">{healthData.issuesCount}</div>
              </div>
              <div className="p-4 rounded-lg border bg-white dark:bg-gray-800">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Update</div>
                <div className="text-sm font-medium">
                  {new Date(healthData.lastUpdate).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Event Log Panel */}
      <EventLog 
        isExpanded={isEventLogExpanded} 
        onToggle={() => setIsEventLogExpanded(!isEventLogExpanded)} 
      />
    </div>
  );
}