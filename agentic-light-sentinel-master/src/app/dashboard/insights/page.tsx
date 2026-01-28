'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardProvider } from '@/components/dashboard/insights/DashboardContext';
import { AutonomousLoopCard } from '@/components/dashboard/insights/AutonomousLoopCard';
import { MetricsCard } from '@/components/dashboard/insights/MetricsCard';
import { AlertsCard } from '@/components/dashboard/insights/AlertsCard';
import { TrendsCard } from '@/components/dashboard/insights/TrendsCard';
import { ActivityStream } from '@/components/dashboard/insights/ActivityStream';
import { DatasetCard } from '@/components/dashboard/insights/DatasetCard';
import { AlertsTable } from '@/components/dashboard/insights/AlertsTable';
import { TrendingEntities } from '@/components/dashboard/insights/TrendingEntities';

// Create a client
const queryClient = new QueryClient();

export default function DashboardPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Insights Monitor</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Real-time monitoring and analysis dashboard
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <AutonomousLoopCard />
              </div>
              <div>
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
          </div>
        </div>
      </DashboardProvider>
    </QueryClientProvider>
  );
}
