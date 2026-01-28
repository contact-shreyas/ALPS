'use client';

import { useDashboard } from './DashboardContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components once per module
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export function TrendsCard() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg p-6 h-96" />;
  }

  if (!data?.trends.daily.length) {
    return null;
  }

  const chartData = {
    labels: data.trends.daily.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Hotspots',
        data: data.trends.daily.map(d => d.hotspots),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Coverage %',
        data: data.trends.daily.map(d => d.coverage),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'percentage'
      }
    ]
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date'
        },
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Count'
        }
      },
      percentage: {
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Coverage %'
        },
        min: 0,
        max: 100,
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Trends Overview</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-500">Hotspots</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-500">Coverage</span>
          </div>
        </div>
      </div>
      
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-2">Top Regions by Activity</h4>
          <div className="space-y-2">
            {data.trends.topRegions.slice(0, 5).map((region, index) => (
              <div key={region.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{index + 1}.</span>
                  <span className="text-sm">{region.name}</span>
                </div>
                <span className="text-sm font-medium">{region.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Processing Performance</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">Success Rate</span>
                <span className="text-sm font-medium">
                  {data.metrics.processing.successRate.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${data.metrics.processing.successRate}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">Average Latency</span>
                <span className="text-sm font-medium">
                  {data.metrics.processing.avgLatencyMs}ms
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.min(100, (data.metrics.processing.avgLatencyMs / 1000) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
