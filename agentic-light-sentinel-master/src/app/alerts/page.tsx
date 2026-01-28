'use client';

import { useState, useCallback } from 'react';
import { Bell, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { AlertsFilterBar } from '@/components/alerts/AlertsFilterBar';
import { AlertsList } from '@/components/alerts/AlertsList';
import { useAlerts, type AlertsFilter } from '@/hooks/useAlerts';

export default function AlertsPage() {
  const [filter, setFilter] = useState<AlertsFilter>({});
  const { data: alerts, isLoading, error } = useAlerts(filter);

  const handleFilterChange = useCallback((newFilter: AlertsFilter) => {
    setFilter(newFilter);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            <div className="text-gray-500 ml-2">Loading alerts...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Bell className="w-6 h-6 mr-2" />
              Alerts
            </h1>
          </div>
        </div>

        {/* Filter Bar */}
                  <AlertsFilterBar 
            onFilterChange={handleFilterChange}
          />

        {/* Alerts List */}
        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading alerts...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-600">
              <span>Error loading alerts: {error instanceof Error ? error.message : 'Unknown error'}</span>
            </div>
          ) : (
            <AlertsList alerts={alerts || []} />
          )}
        </div>
      </div>
    </div>
  );
}