import { useState, useEffect } from 'react';
import { ChartBarIcon, BellIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDate } from '@/lib/utils';

interface TrendData {
  nationalTrend: Array<{ date: string; value: number }>;
  topStates: Array<{ id: string; name: string; count: number }>;
  topDistricts: Array<{ 
    id: string; 
    name: string; 
    stateCode: string; 
    meanRadiance: number;
    location?: { lat: number; lng: number };
  }>;
}

export function TrendPanel() {
  const [data, setData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifying, setNotifying] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await fetch('/api/trends');
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error('Error fetching trends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
    const interval = setInterval(fetchTrends, 5 * 60 * 1000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const handleNotify = async (district: TrendData['topDistricts'][0]) => {
    if (notifying) return;
    setNotifying(district.id);

    try {
      const severity = district.meanRadiance > 50 ? 'high' : district.meanRadiance > 25 ? 'medium' : 'low';

      const response = await fetch('/api/alerts/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district: `${district.name} (${district.stateCode})`,
          severity,
          radiance: district.meanRadiance,
          location: district.location || { lat: 0, lng: 0 }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      // Show success feedback
      const feedbackElement = document.createElement('div');
      feedbackElement.className = 'fixed bottom-4 right-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-lg shadow-lg transition-opacity';
      feedbackElement.textContent = 'Municipality notified successfully';
      document.body.appendChild(feedbackElement);
      setTimeout(() => {
        feedbackElement.style.opacity = '0';
        setTimeout(() => feedbackElement.remove(), 300);
      }, 3000);
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    } finally {
      setNotifying(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <ChartBarIcon className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Trends</h2>
      </div>

      {/* National Trend Chart */}
      <div className="h-64 mb-8">
        {data?.nationalTrend && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.nationalTrend}>
              <XAxis 
                dataKey="date" 
                tickFormatter={(date: string) => formatDate(new Date(date))}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tickFormatter={(value: number) => value.toLocaleString()}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.375rem' }}
                labelStyle={{ color: '#e5e7eb' }}
                itemStyle={{ color: '#e5e7eb' }}
                labelFormatter={(label) => formatDate(new Date(String(label)))}
                formatter={(value) => [Number(value).toLocaleString(), 'Hotspots']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top States */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Top States by Affected Districts
          </h3>
          <div className="space-y-2">
            {data?.topStates.map((state, idx) => (
              <div key={state.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-gray-900 dark:text-white min-w-[24px]">
                    {idx + 1}.
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white flex-1">
                    {state.name}
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {state.count} districts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Districts */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Top Districts by Light Pollution
          </h3>
          <div className="space-y-2">
            {data?.topDistricts.map((district, idx) => (
              <div key={district.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-gray-900 dark:text-white min-w-[24px]">
                    {idx + 1}.
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {district.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {district.stateCode} • {district.meanRadiance.toLocaleString()} nW
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleNotify(district)}
                  disabled={notifying === district.id}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-1.5 transition-colors ${
                    notifying === district.id
                      ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30'
                  }`}
                  title="Send notification to municipality"
                >
                  <BellIcon className="w-4 h-4" />
                  {notifying === district.id ? 'Sending...' : 'Notify'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}