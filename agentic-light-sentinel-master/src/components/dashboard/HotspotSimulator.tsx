import { useState, useEffect } from 'react';
import { BoltIcon } from '@heroicons/react/24/outline';

type Hotspot = {
  id: string;
  district: string;
  state?: string;
  severity: 'high' | 'medium' | 'low';
  brightness: number;
  delta: number;
  detectedAt: string;
};

export function HotspotSimulator() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [simDelta, setSimDelta] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHotspots = async () => {
      try {
        const response = await fetch('/api/hotspots');
        const data = await response.json();
        setHotspots(data.hotspots || []);
      } catch (error) {
        console.error('Error fetching hotspots:', error);
      }
    };

    fetchHotspots();
    const interval = setInterval(fetchHotspots, 30000);
    return () => clearInterval(interval);
  }, []);

  const selectedHotspot = hotspots.find(h => h.id === selected);

  const simulateMitigation = async () => {
    if (!selected) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/hotspots/${selected}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reduction: 0.5 }) // 50% reduction
      });
      const data = await response.json();
      setSimDelta(data.delta);
    } catch (error) {
      console.error('Error simulating mitigation:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendAlert = async () => {
    if (!selected) return;

    setLoading(true);
    try {
      await fetch('/api/email/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotspotId: selected })
      });
    } catch (error) {
      console.error('Error sending alert:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <BoltIcon className="w-5 h-5 text-yellow-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hotspot Alerts</h2>
      </div>

      {hotspots.length > 0 ? (
        <div className="space-y-4">
          <div className="border dark:border-gray-700 rounded-lg divide-y dark:divide-gray-700">
            {hotspots.map(hotspot => (
              <button
                key={hotspot.id}
                onClick={() => setSelected(hotspot.id)}
                className={`w-full px-4 py-3 text-left transition-colors ${
                  selected === hotspot.id 
                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {hotspot.district}{hotspot.state ? `, ${hotspot.state}` : ''}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Detected: {new Date(hotspot.detectedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-sm ${
                    hotspot.severity === 'high' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      : hotspot.severity === 'medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                  }`}>
                    {hotspot.severity}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedHotspot && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                Mitigation Simulator
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Current Brightness
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {selectedHotspot.brightness.toFixed(1)} nW/cm²/sr
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Delta
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {selectedHotspot.delta.toFixed(1)} nW/cm²/sr
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={simulateMitigation}
                    disabled={loading}
                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 
                             disabled:bg-blue-400 rounded-md shadow-sm"
                  >
                    Simulate Mitigation
                  </button>
                  <button
                    onClick={sendAlert}
                    disabled={loading}
                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 
                             disabled:bg-yellow-400 rounded-md shadow-sm"
                  >
                    Send Alert
                  </button>
                </div>

                {simDelta !== null && (
                  <div className="text-sm">
                    <span className="font-medium">Simulated reduction:</span>
                    <span className="ml-1 text-green-600 dark:text-green-400">
                      {simDelta.toFixed(1)} nW/cm²/sr
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          No active hotspots detected
        </div>
      )}
    </div>
  );
}