import { useEffect, useState } from 'react';
import { CircleStackIcon } from '@heroicons/react/24/outline';

type DatasetInfo = {
  product: string;
  coverage: number;
  totalDistricts: number;
  lastTileDate: string | null;
};

export function DatasetPanel() {
  const [data, setData] = useState<DatasetInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dataset/info');
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error('Error fetching dataset info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <CircleStackIcon className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dataset</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Product</div>
          <div className="text-gray-900 dark:text-white">{data?.product || 'VIIRS Black Marble — VNP46A2'}</div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Coverage</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${(data?.coverage || 0) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {data ? `${data.coverage * 100}%` : '0%'}
              {data && ` (${data.totalDistricts} districts)`}
            </span>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Update</div>
          <div className="text-gray-900 dark:text-white">
            {data?.lastTileDate 
              ? new Date(data.lastTileDate).toLocaleDateString()
              : 'No data available'
            }
          </div>
        </div>
      </div>
    </div>
  );
}