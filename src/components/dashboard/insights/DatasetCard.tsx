"use client";

import useSWR from 'swr'
import { api, formatters } from '../../../lib/api-client'
import { Dataset } from '../../../types/dashboard'

export function DatasetCard() {
  const { data, error, isLoading } = useSWR(
    'datasets',
    () => api.datasets.list(),
    { 
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  )

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Datasets</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Datasets</h3>
        <div className="text-center py-8">
          <div className="text-red-500 text-sm">Failed to load datasets</div>
          <div className="text-gray-400 text-xs mt-1">
            {error.message || 'An error occurred'}
          </div>
        </div>
      </div>
    )
  }

  const datasets = data?.datasets || []

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Datasets</h3>
        <div className="text-sm text-gray-500">{data?.total || 0} total</div>
      </div>
      
      {datasets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No datasets available
        </div>
      ) : (
        <ul className="space-y-4">
          {datasets.map((dataset) => (
            <li key={dataset.id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{dataset.name}</h4>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      dataset.status === 'active' ? 'bg-green-100 text-green-800' :
                      dataset.status === 'syncing' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {dataset.status}
                    </span>
                  </div>
                  {dataset.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{dataset.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 min-w-40">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${
                        dataset.coveragePct > 80 ? 'bg-green-500' :
                        dataset.coveragePct > 50 ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }`} 
                      style={{ width: `${dataset.coveragePct}%` }} 
                    />
                  </div>
                  <span className="text-sm font-semibold">{formatters.percentage(dataset.coveragePct)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span className="block text-xs text-gray-500">Type</span>
                  {dataset.kind}
                </div>
                {dataset.recordCount && (
                  <div>
                    <span className="block text-xs text-gray-500">Records</span>
                    {dataset.recordCount.toLocaleString()}
                  </div>
                )}
                {dataset.sizeBytes && (
                  <div>
                    <span className="block text-xs text-gray-500">Size</span>
                    {formatters.fileSize(dataset.sizeBytes)}
                  </div>
                )}
                <div>
                  <span className="block text-xs text-gray-500">Last Updated</span>
                  {formatters.timestamp(dataset.lastUpdatedAt)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
