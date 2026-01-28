"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardProvider } from "@/components/dashboard/insights/DashboardContext";
import { AutonomousLoopCard } from "@/components/dashboard/insights/AutonomousLoopCard";
import { ReportSettings } from "@/components/dashboard/insights/ReportSettings";
import { MetricsCard } from "@/components/dashboard/insights/MetricsCard";
import { AlertsCard } from "@/components/dashboard/insights/AlertsCard";
import { TrendsCard } from "@/components/dashboard/insights/TrendsCard";
import { ActivityStream } from "@/components/dashboard/insights/ActivityStream";
import { DatasetCard } from "@/components/dashboard/insights/DatasetCard";
import { AlertsTable } from "@/components/dashboard/insights/AlertsTable";
import { TrendingEntities } from "@/components/dashboard/insights/TrendingEntities";
import { SystemHealthPanel } from "@/components/dashboard/SystemHealthPanel";
import { KPIOverviewPanel } from "@/components/dashboard/KPIOverviewPanel";
import { ActivityTimeline } from "@/components/dashboard/insights/ActivityTimeline";
import RealTime3DVisualization from "@/components/dashboard/insights/RealTime3DVisualization";

const queryClient = new QueryClient();

export default function InsightsApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Insights Monitor</h1>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Real-time monitoring and analysis dashboard</p>
              </div>
              <ReportSettings 
                onSend={async (email?: string) => {
                  try {
                    console.log('Sending report to:', email || 'default email');
                    const response = await fetch('/api/reports/dashboard', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email })
                    });
                    
                    const result = await response.json();
                    console.log('Report response:', result);
                    
                    if (!response.ok) {
                      throw new Error(result.error || 'Failed to send report');
                    }
                    
                    // Show success feedback
                    const feedbackElement = document.createElement('div');
                    feedbackElement.className = 'fixed bottom-4 right-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-3 rounded-lg shadow-lg z-50';
                    feedbackElement.innerHTML = `
                      <div class="flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                        <span>Dashboard report sent successfully!</span>
                      </div>
                      <div class="text-xs mt-1 opacity-75">Message ID: ${result.messageId || 'N/A'}</div>
                    `;
                    document.body.appendChild(feedbackElement);
                    setTimeout(() => {
                      feedbackElement.style.opacity = '0';
                      setTimeout(() => feedbackElement.remove(), 300);
                    }, 5000);
                  } catch (error) {
                    console.error('Error sending report:', error);
                    
                    // Show error feedback
                    const errorElement = document.createElement('div');
                    errorElement.className = 'fixed bottom-4 right-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg shadow-lg z-50';
                    errorElement.innerHTML = `
                      <div class="flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                        </svg>
                        <span>Failed to send report: ${error.message}</span>
                      </div>
                    `;
                    document.body.appendChild(errorElement);
                    setTimeout(() => {
                      errorElement.style.opacity = '0';
                      setTimeout(() => errorElement.remove(), 300);
                    }, 7000);
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <AutonomousLoopCard />
              </div>
              <div className="space-y-6">
                <KPIOverviewPanel />
                <MetricsCard />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <AlertsCard />
              <DatasetCard />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <AlertsTable />
              <TrendingEntities />
            </div>

            <div className="w-full">
              <TrendsCard />
            </div>

            {/* 3D Visualization */}
            <div className="w-full">
              <RealTime3DVisualization />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-2">
                <ActivityTimeline />
              </div>
              <div className="space-y-6">
                <SystemHealthPanel />
                <ActivityStream />
              </div>
            </div>
          </div>
        </div>
      </DashboardProvider>
    </QueryClientProvider>
  );
}
