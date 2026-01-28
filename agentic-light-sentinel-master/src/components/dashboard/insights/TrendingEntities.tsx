"use client";

import useSWR from 'swr';
import { api } from '../../../lib/api-client';
import { TrendingEntity } from '../../../types/dashboard';

function Sparkline({ values }: { values: number[] }) {
  if (!values || values.length === 0) return null;
  
  const width = 100;
  const height = 24;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values.map((v, i) => {
    const x = (i / Math.max(1, values.length - 1)) * width;
    const y = height - (max === min ? 0.5 : (v - min) / (max - min)) * height;
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height} className="text-blue-500">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points.join(" ")} />
    </svg>
  );
}

export function TrendingEntities() {
  const { data, error, isLoading } = useSWR(
    'trending-entities',
    () => api.entities.trending({ range: '30d' }),
    { 
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Trending Entities</h3>
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
        <h3 className="text-lg font-semibold mb-4">Trending Entities</h3>
        <div className="text-center py-8">
          <div className="text-red-500 text-sm">Failed to load trending entities</div>
          <div className="text-gray-400 text-xs mt-1">
            {error.message || 'An error occurred'}
          </div>
        </div>
      </div>
    )
  }

  const entities = data?.topItems || []

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Trending Entities</h3>
      {entities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No trending entities found
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {entities.map((entity) => (
            <li key={entity.code} className="py-3 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {entity.name}
                  </div>
                  {entity.severity && (
                    <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${
                      entity.severity === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                      entity.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {entity.severity}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <span>{entity.code}</span>
                  <span>•</span>
                  <span>{entity.region}</span>
                  {entity.radiance && (
                    <>
                      <span>•</span>
                      <span>{entity.radiance.toFixed(2)} nW/cm²/sr</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <Sparkline values={entity.spark} />
                <div className="text-sm font-semibold min-w-12 text-right">
                  {entity.score.toFixed(1)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

