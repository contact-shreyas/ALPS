'use client';

import { StatusOverview } from '@/components/dashboard/StatusOverview';
import { DataAnalytics } from '@/components/dashboard/DataAnalytics';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { FilterPanel } from '@/components/panels/FilterPanel';
import InsightsApp from "@/components/dashboard/insights/InsightsApp";
import { NationalTrendChart } from '@/components/dashboard/NationalTrendChart';
import { HotspotTable } from '@/components/dashboard/HotspotTable';
import { useEffect, useState } from 'react';
import { Bell, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    // Add your refresh logic here
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastRefresh(new Date().toLocaleTimeString());
    setLoading(false);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    // Apply filters to dashboard data here
    console.log('Filters applied:', newFilters);
  };

  // Initialize timestamp on client only to prevent hydration mismatch
  useEffect(() => {
    setLastRefresh(new Date().toLocaleTimeString());
    setIsMounted(true);
  }, []);

  // Listen for toggle filters event from QuickActions
  useEffect(() => {
    const handleToggleFilters = (event: CustomEvent) => {
      setShowFilters(event.detail.show);
    };

    window.addEventListener('toggleFilters' as any, handleToggleFilters);
    return () => {
      window.removeEventListener('toggleFilters' as any, handleToggleFilters);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor system performance and light pollution metrics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleRefresh}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {isMounted && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Quick Actions */}
            <QuickActions />

            {/* Status Overview */}
            <StatusOverview />

            {/* National Trends */}
            <NationalTrendChart />

            {/* Analytics Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Analytics Overview</h2>
              </div>
              <DataAnalytics />
            </div>

            {/* Hotspot Table */}
            <HotspotTable />

            {/* Main Insights App */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Light Pollution Insights</h2>
              </div>
              <InsightsApp />
            </div>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          onClose={() => setShowFilters(false)}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Last Update Info */}
      {isMounted && (
        <div className="fixed bottom-4 right-4">
          <div className="bg-white px-3 py-2 rounded-md border border-gray-200 shadow-sm text-sm text-gray-500">
            Last updated: {lastRefresh}
          </div>
        </div>
      )}
    </div>
  );
}
